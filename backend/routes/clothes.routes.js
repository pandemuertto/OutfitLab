// backend/routes/clothes.routes.js
// backend/routes/clothes.routes.js

const { Router } = require("express");
const path = require("path");
const fs = require("fs").promises;
const upload = require("../lib/multer");
const { PrismaClient } = require("@prisma/client");

const { detectClothesWithApi4AI } = require("../services/api4aiFashion.service");
const { normalizeClothingLabel } = require("../utils/normalizeClothing");
const { extractDominantColorFromImage } = require("../services/localColor.service");
const {
  segmentClothesWithPythonCrop,
  getSegmentedBufferFromPythonResult,
} = require("../services/pythonSegmentation.service");
const {
  uploadLocalFileToSupabase,
  uploadBufferToSupabase,
} = require("../services/supabaseStorage.service");

const prisma = new PrismaClient();
const router = Router();

const MIN_CONFIDENCE = 0.65;

router.get("/ping", (_req, res) => {
  res.json({ ok: true, at: new Date().toISOString() });
});

function bboxArea(detection) {
  return (detection?.bbox?.width || 0) * (detection?.bbox?.height || 0);
}

function shouldIgnoreDetection(detection) {
  const rawLabel = String(detection.label || "").toLowerCase();
  const area = bboxArea(detection);

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

  if (!isAlwaysAllowed && isSmallAccessory && area < 0.03) {
    return true;
  }

  if (area < 0.008) {
    return true;
  }

  return false;
}

function pickMainDetection(detections) {
  if (!Array.isArray(detections) || detections.length === 0) return null;

  return [...detections].sort((a, b) => {
    const confDiff = (b.confidence || 0) - (a.confidence || 0);
    if (Math.abs(confDiff) > 0.05) return confDiff;

    return bboxArea(b) - bboxArea(a);
  })[0];
}

async function safeDeleteLocalFile(localPath) {
  try {
    if (localPath) await fs.unlink(localPath);
  } catch (e) {
    console.warn("No se pudo borrar archivo temporal:", e.message);
  }
}

async function detectColorSafe({ imagePath, bbox, fallbackColor }) {
  if (fallbackColor) return String(fallbackColor).toLowerCase().trim();

  try {
    const localColor = await extractDominantColorFromImage(imagePath, bbox || null);
    return localColor?.colorName || null;
  } catch (e) {
    console.warn("No se pudo detectar color:", e.message);
    return null;
  }
}

async function createPrenda({
  userId,
  imageUrl,
  type,
  color,
  brand,
  category,
  confidence,
}) {
  return prisma.prenda.create({
    data: {
      userId,
      imageUrl,
      type: type || null,
      color: color || null,
      brand: brand || null,
      category: category || "other",
      confidence: confidence ?? null,
    },
  });
}

router.post("/upload", upload.single("image"), async (req, res) => {
  const tempOriginalPath = req.file
    ? path.join(__dirname, "..", "uploads", req.file.filename)
    : null;

  const tempSegmentedFiles = [];

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

    const usePython =
      String(process.env.USE_PYTHON_SEGMENTATION || "").trim() === "true";

    console.log("[CLOTHES] imagen temporal:", req.file.filename);
    console.log("[CLOTHES] python activo:", usePython);
    console.log("[CLOTHES] usando Supabase Storage");

    const originalUpload = await uploadLocalFileToSupabase({
      localPath: tempOriginalPath,
      folder: "clothes/original",
      userId,
      fileName: req.file.originalname || req.file.filename,
    });

    const originalPublicUrl = originalUpload.publicUrl;

    console.log("[CLOTHES] original en Supabase:", originalPublicUrl);

    const rawDetections = await detectClothesWithApi4AI(tempOriginalPath);

    let detections = (rawDetections || [])
      .filter((d) => (d.confidence || 0) >= MIN_CONFIDENCE)
      .filter((d) => !shouldIgnoreDetection(d));

    console.log("[CLOTHES] detecciones válidas:", detections.length);

    const savedItems = [];

    // Caso 1: no hay detecciones
    if (!detections.length) {
      const detectedColor = await detectColorSafe({
        imagePath: tempOriginalPath,
        bbox: null,
        fallbackColor: color,
      });

      const prenda = await createPrenda({
        userId,
        imageUrl: originalPublicUrl,
        type: type || null,
        color: detectedColor,
        brand,
        category: "other",
        confidence: null,
      });

      savedItems.push(prenda);

      return res.status(201).json({
        success: true,
        message: "Prenda guardada sin detecciones",
        count: savedItems.length,
        source: "original-storage",
        items: savedItems,
        detections: [],
      });
    }

    // Caso 2: Python desactivado -> guardar solo detección principal
    if (!usePython) {
      const mainDetection = pickMainDetection(detections);
      const normalized = normalizeClothingLabel(mainDetection.label);

      const detectedColor = await detectColorSafe({
        imagePath: tempOriginalPath,
        bbox: mainDetection.bbox || null,
        fallbackColor: color,
      });

      const prenda = await createPrenda({
        userId,
        imageUrl: originalPublicUrl,
        type: type || normalized.type || null,
        color: detectedColor,
        brand,
        category: normalized.category || "other",
        confidence: mainDetection.confidence ?? null,
      });

      savedItems.push(prenda);

      return res.status(201).json({
        success: true,
        message: "Prenda principal guardada sin segmentación",
        count: savedItems.length,
        source: "api4ai-main-detection-storage",
        items: savedItems,
        detections,
      });
    }

    // Caso 3: Python activo -> intentar guardar cada detección segmentada
    for (const detection of detections) {
      const normalized = normalizeClothingLabel(detection.label);

      if (!detection.bbox) {
        console.log("[CLOTHES] detección sin bbox ignorada:", detection.label);
        continue;
      }

      try {
        const pyResult = await segmentClothesWithPythonCrop(
          tempOriginalPath,
          detection.bbox,
          normalized.type || detection.label || "prenda"
        );

        const segmentedBuffer = getSegmentedBufferFromPythonResult(pyResult);

        if (!segmentedBuffer) {
          throw new Error("Python no devolvió image_base64");
        }

        const fileName = `seg_${normalized.type || "prenda"}_${Date.now()}.png`;

        const segmentedUpload = await uploadBufferToSupabase({
          buffer: segmentedBuffer,
          folder: "clothes/segmented",
          userId,
          fileName,
          contentType: "image/png",
        });

        console.log(
          "[CLOTHES] segmentada en Supabase:",
          segmentedUpload.publicUrl
        );

        const tempSegmentedPath = path.join(
          __dirname,
          "..",
          "uploads",
          `tmp_${fileName}`
        );

        await fs.writeFile(tempSegmentedPath, segmentedBuffer);
        tempSegmentedFiles.push(tempSegmentedPath);

        const detectedColor = await detectColorSafe({
          imagePath: tempSegmentedPath,
          bbox: null,
          fallbackColor: color,
        });

        const prenda = await createPrenda({
          userId,
          imageUrl: segmentedUpload.publicUrl,
          type: normalized.type || null,
          color: detectedColor,
          brand,
          category: normalized.category || "other",
          confidence: detection.confidence ?? null,
        });

        savedItems.push(prenda);
      } catch (pythonError) {
        console.warn(
          "[CLOTHES] Python/Storage falló para detección:",
          detection.label,
          "|",
          pythonError.message
        );
      }
    }

    // Si Python falló en todas, guardar solo una prenda principal con la original
    if (!savedItems.length) {
      const mainDetection = pickMainDetection(detections);
      const normalized = normalizeClothingLabel(mainDetection.label);

      const detectedColor = await detectColorSafe({
        imagePath: tempOriginalPath,
        bbox: mainDetection.bbox || null,
        fallbackColor: color,
      });

      const prenda = await createPrenda({
        userId,
        imageUrl: originalPublicUrl,
        type: type || normalized.type || null,
        color: detectedColor,
        brand,
        category: normalized.category || "other",
        confidence: mainDetection.confidence ?? null,
      });

      savedItems.push(prenda);

      return res.status(201).json({
        success: true,
        message:
          "Python falló, se guardó solo la prenda principal con imagen original",
        count: savedItems.length,
        source: "fallback-main-original-storage",
        items: savedItems,
        detections,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Prenda(s) segmentada(s) y guardada(s) correctamente",
      count: savedItems.length,
      source: "api4ai + python + supabase-storage",
      items: savedItems,
      detections,
    });
  } catch (err) {
    console.error("ERROR GENERAL /upload:", err);

    return res.status(500).json({
      error: "No se pudo subir la prenda",
      detail: err.message,
    });
  } finally {
    await safeDeleteLocalFile(tempOriginalPath);

    for (const file of tempSegmentedFiles) {
      await safeDeleteLocalFile(file);
    }
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const prendas = await prisma.prenda.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json(prendas);
  } catch (err) {
    console.error("list error:", err);

    return res.status(500).json({
      error: "No se pudieron obtener las prendas",
      detail: err.message,
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (Number.isNaN(numericId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const { type, color, category, brand } = req.body || {};

    const prendaExistente = await prisma.prenda.findUnique({
      where: { id: numericId },
    });

    if (!prendaExistente) {
      return res.status(404).json({ error: "Prenda no encontrada" });
    }

    const dataToUpdate = {};

    if (type !== undefined) {
      dataToUpdate.type = String(type).trim() || null;
    }

    if (color !== undefined) {
      dataToUpdate.color = String(color).trim().toLowerCase() || null;
    }

    if (category !== undefined) {
      dataToUpdate.category = String(category).trim() || null;
    }

    if (brand !== undefined) {
      dataToUpdate.brand = String(brand).trim() || null;
    }

    const prendaActualizada = await prisma.prenda.update({
      where: { id: numericId },
      data: dataToUpdate,
    });

    return res.json({
      success: true,
      message: "Prenda actualizada correctamente",
      prenda: prendaActualizada,
    });
  } catch (err) {
    console.error("update clothing error:", err);

    return res.status(500).json({
      error: "No se pudo actualizar la prenda",
      detail: err.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (Number.isNaN(numericId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const { type, color, category, brand } = req.body || {};

    const prendaExistente = await prisma.prenda.findUnique({
      where: { id: numericId },
    });

    if (!prendaExistente) {
      return res.status(404).json({ error: "Prenda no encontrada" });
    }

    const dataToUpdate = {};

    if (type !== undefined) {
      dataToUpdate.type = String(type).trim() || null;
    }

    if (color !== undefined) {
      dataToUpdate.color = String(color).trim().toLowerCase() || null;
    }

    if (category !== undefined) {
      dataToUpdate.category = String(category).trim() || null;
    }

    if (brand !== undefined) {
      dataToUpdate.brand = String(brand).trim() || null;
    }

    const prendaActualizada = await prisma.prenda.update({
      where: { id: numericId },
      data: dataToUpdate,
    });

    return res.json({
      success: true,
      message: "Prenda actualizada correctamente",
      prenda: prendaActualizada,
    });
  } catch (err) {
    console.error("update clothing error:", err);

    return res.status(500).json({
      error: "No se pudo actualizar la prenda",
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