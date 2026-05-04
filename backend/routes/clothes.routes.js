const { Router } = require("express");
const path = require("path");
const fs = require("fs").promises;
const upload = require("../lib/multer");
const { PrismaClient } = require("@prisma/client");

const { segmentClothesWithPython } = require("../services/pythonSegmentation.service");
const { detectClothesWithApi4AI } = require("../services/api4aiFashion.service");
const { normalizeClothingLabel } = require("../utils/normalizeClothing");
const { extractDominantColorFromImage } = require("../services/localColor.service");
const { importSegmentedFileToUploads } = require("../utils/importSegmentedFile");

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

    const absoluteImagePath = path.join(
      __dirname,
      "..",
      "uploads",
      req.file.filename
    );

    const savedItems = [];
    const usePython = String(process.env.USE_PYTHON_SEGMENTATION) === "true";

    if (usePython) {
      try {
        const pyResult = await segmentClothesWithPython(absoluteImagePath);

        if (Array.isArray(pyResult?.items) && pyResult.items.length > 0) {
          for (const item of pyResult.items) {
            const imported = await importSegmentedFileToUploads(item.file_path);

            let detectedColor = color ? String(color).toLowerCase().trim() : null;

            if (!detectedColor) {
              try {
                const localColor = await extractDominantColorFromImage(
                  imported.absolutePath
                );
                detectedColor = localColor.colorName;
              } catch (e) {
                console.warn("No se pudo detectar color local del segmento:", e.message);
              }
            }

            const prenda = await prisma.prenda.create({
              data: {
                userId,
                imageUrl: imported.relativeUrl,
                type: item.type || null,
                color: detectedColor || null,
                brand: brand || null,
                category: item.category || "other",
                confidence: item.score ?? null,
              },
            });

            savedItems.push(prenda);
          }

          const base = `${req.protocol}://${req.get("host")}`;

          return res.status(201).json({
            success: true,
            message: "Prendas segmentadas y guardadas correctamente",
            count: savedItems.length,
            items: savedItems.map((item) => ({
              ...item,
              imageUrl: item.imageUrl.startsWith("http")
                ? item.imageUrl
                : `${base}${item.imageUrl}`,
            })),
          });
        }
      } catch (pythonError) {
        console.error("Error usando servicio Python:", pythonError.message);
      }
    }

    try {
      const relativeUrl = `/uploads/${req.file.filename}`;
      const rawDetections = await detectClothesWithApi4AI(absoluteImagePath);

      const detections = (rawDetections || []).filter(
        (d) => (d.confidence || 0) >= MIN_CONFIDENCE
      );

      if (detections.length > 0) {
        for (const detection of detections) {
          const normalized = normalizeClothingLabel(detection.label);

          let detectedColor = color ? String(color).toLowerCase().trim() : null;

          if (!detectedColor) {
            try {
              const localColor = await extractDominantColorFromImage(
                absoluteImagePath,
                detection.bbox
              );
              detectedColor = localColor.colorName;
            } catch (e) {
              console.warn("No se pudo detectar color en fallback:", e.message);
            }
          }

          const prenda = await prisma.prenda.create({
            data: {
              userId,
              imageUrl: relativeUrl,
              type: normalized.type || null,
              color: detectedColor || null,
              brand: brand || null,
              category: normalized.category || "other",
              confidence: detection.confidence ?? null,
            },
          });

          savedItems.push(prenda);
        }
      } else {
        let detectedColor = color ? String(color).toLowerCase().trim() : null;

        if (!detectedColor) {
          try {
            const localColor = await extractDominantColorFromImage(
              absoluteImagePath
            );
            detectedColor = localColor.colorName;
          } catch (e) {
            console.warn("No se pudo detectar color en fallback simple:", e.message);
          }
        }

        const prenda = await prisma.prenda.create({
          data: {
            userId,
            imageUrl: relativeUrl,
            type: type || null,
            color: detectedColor || null,
            brand: brand || null,
            category: "other",
            confidence: null,
          },
        });

        savedItems.push(prenda);
      }
    } catch (fallbackError) {
      console.error("Error en fallback API4AI:", fallbackError.message);
      return res.status(500).json({
        error: "No se pudo procesar la prenda",
        detail: fallbackError.message,
      });
    }

    const base = `${req.protocol}://${req.get("host")}`;

    return res.status(201).json({
      success: true,
      message: "Prenda(s) guardada(s)",
      count: savedItems.length,
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

/**
 * GET /api/clothes/user/:userId
 */
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

/**
 * DELETE /api/clothes/:id
 */
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