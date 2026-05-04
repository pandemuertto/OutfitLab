//backend/services/api4aiFashion.service.js
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

function buildApi4AiHeaders(form) {
  const headers = {
    ...form.getHeaders(),
  };

  if (process.env.API4AI_API_KEY) {
    headers["X-API-Key"] = process.env.API4AI_API_KEY;
  }

  return headers;
}

function buildApi4AiAuth() {
  if (process.env.API4AI_USERNAME && process.env.API4AI_PASSWORD) {
    return {
      username: process.env.API4AI_USERNAME,
      password: process.env.API4AI_PASSWORD,
    };
  }

  return undefined;
}

function getBestClass(classes) {
  if (!classes) {
    return { label: "unknown", confidence: 0 };
  }

  // Caso 1: classes viene como objeto { shirt: 0.95, coat: 0.12 }
  if (!Array.isArray(classes) && typeof classes === "object") {
    const entries = Object.entries(classes);

    if (!entries.length) {
      return { label: "unknown", confidence: 0 };
    }

    const [label, confidence] = entries.reduce((best, current) =>
      Number(current[1]) > Number(best[1]) ? current : best
    );

    return {
      label,
      confidence: Number(confidence) || 0,
    };
  }

  // Caso 2: classes viene como array
  if (Array.isArray(classes)) {
    const normalized = classes.map((item) => ({
      label: item?.name || item?.label || "unknown",
      confidence: Number(item?.confidence || item?.score || item?.probability || 0),
    }));

    if (!normalized.length) {
      return { label: "unknown", confidence: 0 };
    }

    return normalized.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );
  }

  return { label: "unknown", confidence: 0 };
}

function normalizeBox(box) {
  if (!box) {
    return null;
  }

  // Caso 1: array [x, y, width, height]
  if (Array.isArray(box)) {
    return {
      x: Number(box[0] ?? 0),
      y: Number(box[1] ?? 0),
      width: Number(box[2] ?? 0),
      height: Number(box[3] ?? 0),
    };
  }

  // Caso 2: objeto
  return {
    x: Number(box.x ?? box.left ?? 0),
    y: Number(box.y ?? box.top ?? 0),
    width: Number(box.width ?? 0),
    height: Number(box.height ?? 0),
  };
}

function extractObjects(apiData) {
  // Vamos intentando distintas rutas posibles según la respuesta
  const candidates = [
    apiData?.results?.[0]?.entities?.[0]?.objects,
    apiData?.results?.[0]?.objects,
    apiData?.objects,
    apiData?.result?.objects,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function parseApi4AiDetections(apiData) {
  const objects = extractObjects(apiData);

  return objects.map((obj) => {
    const nestedClasses =
      obj?.entities?.[0]?.classes ||
      obj?.classes ||
      obj?.labels ||
      null;

    const best = getBestClass(nestedClasses);

    return {
      label: best.label,
      confidence: best.confidence,
      bbox: normalizeBox(obj?.box || obj?.bbox || obj?.bounding_box),
      raw: obj,
    };
  });
}

async function detectClothesWithApi4AI(imagePath) {
  try {
    const form = new FormData();
    form.append("image", fs.createReadStream(imagePath));

    const response = await axios.post(process.env.API4AI_FASHION_URL, form, {
      headers: buildApi4AiHeaders(form),
      auth: buildApi4AiAuth(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 30000,
    });

    const detections = parseApi4AiDetections(response.data);

    return detections;
  } catch (error) {
    console.error("❌ Error en API4AI:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = { detectClothesWithApi4AI };