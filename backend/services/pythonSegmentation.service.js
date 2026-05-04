// backend/services/pythonSegmentation.service.js

const fs = require("fs/promises");
const path = require("path");

// URL de la API Python.
// Local:
// PYTHON_AI_URL=http://localhost:8000
//
// Render:
// PYTHON_AI_URL=https://closi-ai.onrender.com
const PYTHON_AI_URL = (process.env.PYTHON_AI_URL || "http://localhost:8000").replace(/\/$/, "");

// Activar o desactivar segmentación con Python.
// USE_PYTHON_SEGMENTATION=true
function isPythonSegmentationEnabled() {
  return String(process.env.USE_PYTHON_SEGMENTATION || "false").toLowerCase() === "true";
}

function normalizeBbox(bbox) {
  if (!bbox) {
    return null;
  }

  // Si ya viene como string JSON, lo dejamos pasar.
  if (typeof bbox === "string") {
    try {
      JSON.parse(bbox);
      return bbox;
    } catch {
      return null;
    }
  }

  // Si viene como objeto, lo convertimos a string JSON.
  if (typeof bbox === "object") {
    return JSON.stringify(bbox);
  }

  return null;
}

async function filePathToBlob(filePath) {
  const buffer = await fs.readFile(filePath);

  const ext = path.extname(filePath).toLowerCase();

  let mimeType = "image/jpeg";

  if (ext === ".png") {
    mimeType = "image/png";
  } else if (ext === ".webp") {
    mimeType = "image/webp";
  } else if (ext === ".jpg" || ext === ".jpeg") {
    mimeType = "image/jpeg";
  }

  return new Blob([buffer], { type: mimeType });
}

/**
 * Segmenta una prenda usando la API Python.
 *
 * Parámetros esperados:
 * {
 *   imagePath: "ruta/local/del/archivo.jpg",
 *   bbox: { x, y, width, height },
 *   label: "vestido"
 * }
 *
 * Retorna:
 * {
 *   success: true,
 *   imageUrl: "https://closi-ai.onrender.com/outputs_fast/archivo.png",
 *   file_url: "...",
 *   ...
 * }
 */
async function segmentCrop({ imagePath, bbox, label = "prenda" }) {
  if (!isPythonSegmentationEnabled()) {
    return {
      success: false,
      skipped: true,
      reason: "USE_PYTHON_SEGMENTATION no está activo",
    };
  }

  if (!imagePath) {
    throw new Error("No se recibió imagePath para segmentar con Python.");
  }

  const bboxJson = normalizeBbox(bbox);

  if (!bboxJson) {
    throw new Error("No se recibió un bbox válido para segmentar con Python.");
  }

  const endpoint = `${PYTHON_AI_URL}/segment-crop`;

  console.log("🐍 Enviando imagen a Python:", endpoint);
  console.log("📦 BBox:", bboxJson);
  console.log("🏷️ Label:", label);

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

  let data;

  try {
    data = await response.json();
  } catch {
    const text = await response.text();
    throw new Error(`Python respondió algo inválido: ${text}`);
  }

  if (!response.ok) {
    console.error("❌ Error desde Python:", data);
    throw new Error(data?.detail || "Error al segmentar con Python.");
  }

  const imageUrl =
    data.file_url ||
    data.imageUrl ||
    data.url ||
    null;

  if (!imageUrl) {
    console.warn("⚠️ Python no devolvió file_url. Respuesta:", data);
  }

  return {
    ...data,
    success: true,
    imageUrl,
    file_url: imageUrl,
  };
}

/**
 * Alias por si tu backend ya usa otro nombre.
 * Así evitamos romper rutas existentes.
 */
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
  segmentCrop,
  segmentWithPython,
  segmentCropWithPython,
  pythonSegmentCrop,
};