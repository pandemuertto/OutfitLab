// backend/services/pythonSegmentation.service.js

const fs = require("fs/promises");
const path = require("path");

const PYTHON_AI_URL = (
  process.env.PYTHON_AI_URL || "http://localhost:8000"
).replace(/\/$/, "");

function isPythonSegmentationEnabled() {
  return (
    String(process.env.USE_PYTHON_SEGMENTATION || "")
      .trim()
      .toLowerCase() === "true"
  );
}

function normalizeBbox(bbox) {
  if (!bbox) return null;

  if (typeof bbox === "string") {
    try {
      JSON.parse(bbox);
      return bbox;
    } catch {
      return null;
    }
  }

  if (typeof bbox === "object") {
    return JSON.stringify(bbox);
  }

  return null;
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";

  return "image/jpeg";
}

async function filePathToBlob(filePath) {
  const buffer = await fs.readFile(filePath);
  const mimeType = getMimeType(filePath);

  return new Blob([buffer], { type: mimeType });
}

async function segmentClothesWithPythonCrop(imagePath, bbox, label = "prenda") {
  if (!isPythonSegmentationEnabled()) {
    console.log("🐍 Segmentación Python desactivada por variable de entorno.");

    return {
      success: false,
      skipped: true,
      reason: "USE_PYTHON_SEGMENTATION no está en true",
    };
  }

  if (!imagePath) {
    throw new Error("No se recibió imagePath para segmentación Python.");
  }

  const bboxJson = normalizeBbox(bbox);

  if (!bboxJson) {
    throw new Error("No se recibió bbox válido para segmentación Python.");
  }

  const endpoint = `${PYTHON_AI_URL}/segment-crop`;

  console.log("🐍 Enviando imagen a Python:", endpoint);
  console.log("🐍 imagePath:", imagePath);
  console.log("🐍 bbox:", bboxJson);
  console.log("🐍 label:", label);

  const fileBlob = await filePathToBlob(imagePath);
  const filename = path.basename(imagePath);

  const formData = new FormData();
  formData.append("file", fileBlob, filename);
  formData.append("bbox", bboxJson);
  formData.append("label", label || "prenda");

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Python respondió algo que no es JSON: ${text}`);
  }

  if (!response.ok) {
    console.error("❌ Python respondió error:", data);
    throw new Error(data?.detail || data?.error || "Error en API Python.");
  }

  const imageUrl =
    data.imageUrl ||
    data.file_url ||
    data.url ||
    null;

  console.log("✅ Python crop OK:", {
    file: data.file,
    imageUrl,
    file_url: data.file_url,
    mode: data.mode,
  });

  if (!imageUrl) {
    throw new Error("Python no devolvió imageUrl/file_url pública.");
  }

  return {
    ...data,
    success: true,
    imageUrl,
    file_url: imageUrl,
    url: imageUrl,
  };
}

// Alias por compatibilidad
async function segmentCrop(params) {
  return segmentClothesWithPythonCrop(
    params.imagePath,
    params.bbox,
    params.label
  );
}

async function segmentWithPython(params) {
  return segmentCrop(params);
}

async function segmentCropWithPython(params) {
  return segmentCrop(params);
}

async function pythonSegmentCrop(params) {
  return segmentCrop(params);
}

module.exports = {
  PYTHON_AI_URL,
  isPythonSegmentationEnabled,
  segmentClothesWithPythonCrop,
  segmentCrop,
  segmentWithPython,
  segmentCropWithPython,
  pythonSegmentCrop,
};