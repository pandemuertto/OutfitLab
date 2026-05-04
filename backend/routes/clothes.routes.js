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
const { segmentClothesWithPythonCrop } = require("../services/pythonSegmentation.service");

const prisma = new PrismaClient();
const router = Router();

const MIN_CONFIDENCE = 0.65;

function isAbsoluteUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

function getBackendBaseUrl(req) {
  const envUrl =
    process.env.PUBLIC_BACKEND_URL ||
    process.env.BACKEND_PUBLIC_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    "";

  if (envUrl) return envUrl.replace(/\/$/, "");

  return `${req.protocol}://${req.get("host")}`;
}

function normalizePublicImageUrl(req, imageUrl) {
  if (!imageUrl) return imageUrl;

  const clean = String(imageUrl).trim();

  if (!clean) return clean;

  if (isAbsoluteUrl(clean)) return clean;

  const base = getBackendBaseUrl(req);
  const cleanPath = clean.startsWith("/") ? clean : `/${clean}`;

  return `${base}${cleanPath}`;
}

function makeRelativeUploadUrl(filename) {
  return `/uploads/${filename}`;
}

async function safeDeleteLocalImage(imageUrl) {
  if (!imageUrl || isAbsoluteUrl(imageUrl)) return;

  const cleanRelativePath = imageUrl.replace(/^\/+/, "");
  const imagePath = path.join(__dirname, "..", cleanRelativePath);

  try {
    await fs.unlink(imagePath);
  } catch (e) {
    console.warn("No se pudo eliminar el archivo local:", e.message);
  }
}

function shouldIgnoreDetection(detection) {
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
    return true;
  }

  if (bboxArea < 0.008) {
    return true;
  }

  return false;
}

async function getDetectedColor({ color, absoluteImagePath, bbox }) {
  let detectedColor = color ? String(color).toLowerCase().trim() : null;

  if (!detectedColor) {
    try {
      const localColor = await extractDominantColorFromImage(
        absoluteImagePath,
        bbox || null
      );

      detectedColor = localColor.colorName;
    } catch (e) {
      console.warn("No se pudo detectar color:", e.message);
    }
  }

  return detectedColor;
}

router.get("/ping", (_req, res) => {
  res.json({
    ok: true,
    at: new Date().toISOString(),
  });
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

    const originalRelativeUrl = makeRelativeUploadUrl(req.file.filename);
    const originalPublicUrl = normalizePublicImageUrl(req, originalRelativeUrl);

    const usePython =
      String(process.env.USE_PYTHON_SEGMENTATION || "")
        .trim()
        .toLowerCase() === "true";

    const savedItems = [];

    console.log("====================================================");
    console.log("[FAST FLOW] imagen:", req.file.filename);
    console.log("[FAST FLOW] absoluteImagePath:", absoluteImagePath);
    console.log("[FAST FLOW] originalPublicUrl:", originalPublicUrl);
    console.log("[FAST FLOW] python activo:", usePython);
    console.log("[FAST FLOW] PYTHON_AI_URL:", process.env.PYTHON_AI_URL);
    console.log("====================================================");

    const rawDetections = await detectClothesWithApi4AI(absoluteImagePath);

    const detections = (rawDetections || []).filter(
      (d) => (d.confidence || 0) >= MIN_CONFIDENCE
    );

    console.log("[FAST FLOW] detecciones válidas:", detections.length);
    console.log("[FAST FLOW] detecciones:", detections);

    if (!detections.length) {
      const detectedColor = await getDetectedColor({
        color,
        absoluteImagePath,
        bbox: null,
      });

      const prenda = await prisma.prenda.create({
        data: {
          userId,
          imageUrl: originalPublicUrl,
          type: type || "prenda",
          color: detectedColor || null,
          brand: brand || null,
          category: "other",
          confidence: null,
        },
      });

      savedItems.push(prenda);
    } else {
      for (const detection of detections) {
        if (shouldIgnoreDetection(detection)) {
          console.log(
            "[FAST FLOW] detección ignorada:",
            detection.label,
            detection.bbox
          );
          continue;
        }

        const normalized = normalizeClothingLabel(detection.label);

        let finalImageUrl = originalPublicUrl;
        let segmentationMode = "original";

        if (usePython && detection.bbox) {
          try {
            const pyResult = await segmentClothesWithPythonCrop(
              absoluteImagePath,
              detection.bbox,
              normalized.type || detection.label || "prenda"
            );

            if (pyResult?.imageUrl || pyResult?.file_url) {
              finalImageUrl = pyResult.imageUrl || pyResult.file_url;
              segmentationMode = pyResult.mode || "python";
            }

            console.log("[FAST FLOW] Segmentación usada:", {
              label: detection.label,
              finalImageUrl,
              segmentationMode,
            });
          } catch (pythonError) {
            console.warn(
              "[FAST FLOW] Python crop falló, se usa imagen original:",
              pythonError.message
            );

            finalImageUrl = originalPublicUrl;
            segmentationMode = "fallback-original";
          }
        } else {
          console.log("[FAST FLOW] Python no usado para:", detection.label);
        }

        finalImageUrl = normalizePublicImageUrl(req, finalImageUrl);

        const detectedColor = await getDetectedColor({
          color,
          absoluteImagePath,
          bbox: detection.bbox,
        });

        const finalType = normalized.type || type || detection.label || "prenda";
        const finalCategory = normalized.category || "other";

        const prenda = await prisma.prenda.create({
          data: {
            userId,
            imageUrl: finalImageUrl,
            type: finalType,
            color: detectedColor || null,
            brand: brand || null,
            category: finalCategory,
            confidence: detection.confidence ?? null,
          },
        });

        savedItems.push({
          ...prenda,
          segmentationMode,
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Prenda(s) procesada(s) correctamente",
      count: savedItems.length,
      source: "api4ai + python-segmentation",
      items: savedItems.map((item) => ({
        ...item,
        imageUrl: normalizePublicImageUrl(req, item.imageUrl),
        image_url: normalizePublicImageUrl(req, item.imageUrl),
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
      imageUrl: normalizePublicImageUrl(req, p.imageUrl),
      image_url: normalizePublicImageUrl(req, p.imageUrl),
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

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (Number.isNaN(numericId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const { type, category, color, brand } = req.body;

    const updated = await prisma.prenda.update({
      where: { id: numericId },
      data: {
        type: type || null,
        category: category || null,
        color: color || null,
        brand: brand || null,
      },
    });

    return res.json({
      success: true,
      item: {
        ...updated,
        imageUrl: normalizePublicImageUrl(req, updated.imageUrl),
        image_url: normalizePublicImageUrl(req, updated.imageUrl),
      },
    });
  } catch (err) {
    console.error("update error:", err);

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