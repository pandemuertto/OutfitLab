const { Router } = require("express");
const path = require("path");
const fs = require("fs").promises;
const upload = require("../lib/multer");
const { PrismaClient } = require("@prisma/client");

const { detectClothesWithApi4AI } = require("../services/api4aiFashion.service");
const { normalizeClothingLabel } = require("../utils/normalizeClothing");
const { extractDominantColorFromImage } = require("../services/localColor.service");
const { segmentClothesWithPythonCrop } = require("../services/pythonSegmentation.service");

const prisma = new PrismaClient();
const router = Router();

const MIN_CONFIDENCE = 0.65;

function isAbsoluteUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

function makePublicUrl(req, imageUrl) {
  if (!imageUrl) return imageUrl;

  if (isAbsoluteUrl(imageUrl)) {
    return imageUrl;
  }

  const base = `${req.protocol}://${req.get("host")}`;
  const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;

  return `${base}${cleanPath}`;
}

function getStoredImageUrlFromPython(pyResult, fallbackUrl) {
  /*
    La API Python nueva debe regresar algo así:
    {
      file_url: "https://closi-ai.onrender.com/outputs_fast/archivo.png",
      imageUrl: "https://closi-ai.onrender.com/outputs_fast/archivo.png",
      file_path: "/opt/render/project/src/outputs_fast/archivo.png"
    }

    Para la app móvil necesitamos guardar una URL pública,
    NO file_path, porque file_path es ruta interna del servidor Python.
  */
  return (
    pyResult?.imageUrl ||
    pyResult?.file_url ||
    pyResult?.url ||
    fallbackUrl
  );
}

async function safeDeleteLocalImage(imageUrl) {
  /*
    Solo intentamos borrar archivos locales del backend.
    Si imageUrl es https://..., no se borra desde aquí porque pertenece
    a otro servicio o a un storage externo.
  */
  if (!imageUrl || isAbsoluteUrl(imageUrl)) return;

  const cleanRelativePath = imageUrl.replace(/^\/+/, "");
  const imagePath = path.join(__dirname, "..", cleanRelativePath);

  try {
    await fs.unlink(imagePath);
  } catch (e) {
    console.warn("No se pudo eliminar el archivo local:", e.message);
  }
}

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

    const originalRelativeUrl = `/uploads/${req.file.filename}`;
    const savedItems = [];
    const usePython =
      String(process.env.USE_PYTHON_SEGMENTATION || "")
        .trim()
        .toLowerCase() === "true";

    console.log("[FAST FLOW] imagen:", req.file.filename);
    console.log("[FAST FLOW] python activo:", usePython);
    console.log("[FAST FLOW] PYTHON_AI_URL:", process.env.PYTHON_AI_URL);

    // 1) Detectar prendas con API4AI
    const rawDetections = await detectClothesWithApi4AI(absoluteImagePath);

    const detections = (rawDetections || []).filter(
      (d) => (d.confidence || 0) >= MIN_CONFIDENCE
    );

    console.log("[FAST FLOW] detecciones válidas:", detections.length);

    // 2) Si no hubo detecciones, se guarda la imagen original
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
      // 3) Si hubo detecciones, guardar una prenda por cada detección válida
      for (const detection of detections) {
        const normalized = normalizeClothingLabel(detection.label);
        const rawLabel = String(detection.label || "").toLowerCase();

        const bboxArea =
          (detection.bbox?.width || 0) * (detection.bbox?.height || 0);

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
          "lentes",
        ];

        const smallAccessoryTypes = [
          "necklace",
          "earring",
          "jewelry",
          "collar",
          "bracelet",
          "ring",
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

        // 4) Si Python está activo, pedir recorte/segmentación
        if (usePython && detection.bbox) {
          try {
            const pyResult = await segmentClothesWithPythonCrop(
              absoluteImagePath,
              detection.bbox,
              normalized.type || detection.label || "prenda"
            );

            console.log("[FAST FLOW] Python crop OK:", {
              file: pyResult?.file,
              file_url: pyResult?.file_url,
              imageUrl: pyResult?.imageUrl,
              file_path: pyResult?.file_path,
            });

            /*
              Cambio importante:
              Antes usabas pyResult.file_path y lo importabas a uploads.
              Eso no sirve bien cuando Python vive en otro servicio de Render.

              Ahora guardamos pyResult.file_url / pyResult.imageUrl,
              que debe ser una URL pública de closi-ai.
            */
            finalImageUrl = getStoredImageUrlFromPython(
              pyResult,
              originalRelativeUrl
            );
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
            /*
              Si la imagen final es URL pública de Python, no podemos calcular
              color desde ruta local del backend. En ese caso usamos la imagen
              original local y el bbox detectado por API4AI.
            */
            const imageForColor = isAbsoluteUrl(finalImageUrl)
              ? absoluteImagePath
              : finalImageUrl === originalRelativeUrl
                ? absoluteImagePath
                : path.join(__dirname, "..", finalImageUrl.replace(/^\/+/, ""));

            const bboxForColor =
              imageForColor === absoluteImagePath ? detection.bbox : null;

            const localColor = await extractDominantColorFromImage(
              imageForColor,
              bboxForColor
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

    return res.status(201).json({
      success: true,
      message: "Prenda(s) procesada(s) correctamente",
      count: savedItems.length,
      source: "api4ai + python-fast-crop",
      items: savedItems.map((item) => ({
        ...item,
        imageUrl: makePublicUrl(req, item.imageUrl),
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
    const prendas = await prisma.prenda.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: "desc" },
    });

    const prendasConUrl = prendas.map((p) => ({
      ...p,
      imageUrl: makePublicUrl(req, p.imageUrl),
    }));

    return res.json(prendasConUrl);
  } catch (err) {
    console.error("list error:", err);

    return res.status(500).json({
      error: "No se pudieron obtener las prendas",
      detail: err.message,
    });
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

    await safeDeleteLocalImage(prenda.imageUrl);

    await prisma.prenda.delete({
      where: { id: numericId },
    });

    return res.json({
      success: true,
      message: "Prenda eliminada",
    });
  } catch (err) {
    console.error("delete error:", err);

    return res.status(500).json({
      error: "No se pudo eliminar la prenda",
      detail: err.message,
    });
  }
});

module.exports = router;