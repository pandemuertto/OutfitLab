const { Router } = require("express");
const path = require("path");
const fs = require("fs").promises;
const upload = require("../lib/multer");
const { PrismaClient } = require("@prisma/client");

const { detectClothesWithApi4AI } = require("../services/api4aiFashion.service");
const { normalizeClothingLabel } = require("../utils/normalizeClothing");
const { extractDominantColorFromImage } = require("../services/localColor.service");
const { importSegmentedFileToUploads } = require("../utils/importSegmentedFile");
const { segmentClothesWithPythonCrop } = require("../services/pythonSegmentation.service");

const prisma = new PrismaClient();
const router = Router();

const MIN_CONFIDENCE = 0.65;

router.get("/ping", (_req, res) => {
  res.json({ ok: true, at: new Date().toISOString() });
});

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { userId, type, color, brand } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Falta userId" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Falta archivo image" });
    }

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const absoluteImagePath = path.join(__dirname, "..", "uploads", req.file.filename);
    const originalRelativeUrl = `/uploads/${req.file.filename}`;
    const savedItems = [];
    const usePython = String(process.env.USE_PYTHON_SEGMENTATION).trim() === "true";

    console.log("[FAST FLOW] imagen:", req.file.filename);
    console.log("[FAST FLOW] python activo:", usePython);

    // 1) API4AI primero
    const rawDetections = await detectClothesWithApi4AI(absoluteImagePath);
    const detections = (rawDetections || []).filter(
      (d) => (d.confidence || 0) >= MIN_CONFIDENCE
    );

    console.log("[FAST FLOW] detecciones válidas:", detections.length);

    if (!detections.length) {
      let detectedColor = color ? String(color).toLowerCase().trim() : null;

      if (!detectedColor) {
        try {
          const localColor = await extractDominantColorFromImage(absoluteImagePath);
          detectedColor = localColor.colorName;
        } catch (e) {
          console.warn("No se pudo detectar color:", e.message);
        }
      }

      const prenda = await prisma.prenda.create({
        data: {
          userId,
          imageUrl: originalRelativeUrl,
          type: type || null,
          color: detectedColor || null,
          brand: brand || null,
          category: "other",
          confidence: null,
        },
      });

      savedItems.push(prenda);
    } else {
      for (const detection of detections) {
        const normalized = normalizeClothingLabel(detection.label);
        const rawLabel = String(detection.label || "").toLowerCase();

        const bboxArea = (detection.bbox?.width || 0) * (detection.bbox?.height || 0);

        const alwaysAllowAccessories = [
          "hat",
          "cap",
          "bag",
          "belt",
          "scarf",
          "glasses",
          "sunglasses",
          "sombrero",
          "gorra",
          "bolso",
          "bufanda",
          "lentes"
        ];

        const smallAccessoryTypes = [
          "necklace",
          "earring",
          "jewelry",
          "collar",
          "bracelet",
          "ring"
        ];

        const isAlwaysAllowed = alwaysAllowAccessories.some((word) =>
          rawLabel.includes(word)
        );

        const isSmallAccessory = smallAccessoryTypes.some((word) =>
          rawLabel.includes(word)
        );

        if (!isAlwaysAllowed && isSmallAccessory && bboxArea < 0.03) {
          console.log(
            "[FAST FLOW] detección ignorada por accesorio pequeño:",
            detection.label,
            "| bboxArea =",
            bboxArea
          );
          continue;
        }

        if (bboxArea < 0.008) {
          console.log(
            "[FAST FLOW] detección ignorada por bbox demasiado pequeña:",
            detection.label,
            "| bboxArea =",
            bboxArea
          );
          continue;
        }

        let finalImageUrl = originalRelativeUrl;

        if (usePython && detection.bbox) {
          try {
            const pyResult = await segmentClothesWithPythonCrop(
              absoluteImagePath,
              detection.bbox,
              normalized.type || detection.label || "prenda"
            );

            console.log("[FAST FLOW] Python crop OK:", pyResult?.file);

            if (pyResult?.file_path) {
              const imported = await importSegmentedFileToUploads(pyResult.file_path);
              finalImageUrl = imported.relativeUrl;
            }
          } catch (pythonError) {
            console.warn(
              "[FAST FLOW] Python crop falló, se usa imagen original:",
              pythonError.message
            );
          }
        }

        let detectedColor = color ? String(color).toLowerCase().trim() : null;

        if (!detectedColor) {
          try {
            const imageForColor =
              finalImageUrl === originalRelativeUrl
                ? absoluteImagePath
                : path.join(__dirname, "..", finalImageUrl.replace(/^\/+/, ""));

            const localColor = await extractDominantColorFromImage(
              imageForColor,
              finalImageUrl === originalRelativeUrl ? detection.bbox : null
            );

            detectedColor = localColor.colorName;
          } catch (e) {
            console.warn("No se pudo detectar color:", e.message);
          }
        }

        const prenda = await prisma.prenda.create({
          data: {
            userId,
            imageUrl: finalImageUrl,
            type: normalized.type || null,
            color: detectedColor || null,
            brand: brand || null,
            category: normalized.category || "other",
            confidence: detection.confidence ?? null,
          },
        });

        savedItems.push(prenda);
      }
    }

    const base = `${req.protocol}://${req.get("host")}`;

    return res.status(201).json({
      success: true,
      message: "Prenda(s) procesada(s) correctamente",
      count: savedItems.length,
      source: "api4ai + python-fast-crop",
      items: savedItems.map((item) => ({
        ...item,
        imageUrl: item.imageUrl.startsWith("http")
          ? item.imageUrl
          : `${base}${item.imageUrl}`,
      })),
    });
  } catch (err) {
    console.error("ERROR GENERAL /upload:", err);
    return res.status(500).json({
      error: "No se pudo subir la prenda",
      detail: err.message,
    });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const base = `${req.protocol}://${req.get("host")}`;

    const prendas = await prisma.prenda.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: "desc" },
    });

    const prendasConUrl = prendas.map((p) => ({
      ...p,
      imageUrl: p.imageUrl.startsWith("http")
        ? p.imageUrl
        : `${base}${p.imageUrl}`,
    }));

    return res.json(prendasConUrl);
  } catch (err) {
    console.error("list error:", err);
    return res.status(500).json({ error: "No se pudieron obtener las prendas" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (Number.isNaN(numericId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const prenda = await prisma.prenda.findUnique({
      where: { id: numericId },
    });

    if (!prenda) {
      return res.status(404).json({ error: "Prenda no encontrada" });
    }

    if (prenda.imageUrl && !prenda.imageUrl.startsWith("http")) {
      const cleanRelativePath = prenda.imageUrl.replace(/^\/+/, "");
      const imagePath = path.join(__dirname, "..", cleanRelativePath);

      try {
        await fs.unlink(imagePath);
      } catch (e) {
        console.warn("No se pudo eliminar el archivo:", e.message);
      }
    }

    await prisma.prenda.delete({
      where: { id: numericId },
    });

    return res.json({ success: true, message: "Prenda eliminada" });
  } catch (err) {
    console.error("delete error:", err);
    return res.status(500).json({ error: "No se pudo eliminar la prenda" });
  }
});

module.exports = router;