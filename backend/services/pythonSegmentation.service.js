// backend/services/pythonSegmentation.service.js
// backend/services/pythonSegmentation.service.js

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function segmentClothesWithPythonCrop(imagePath, bbox, label = "prenda") {
  if (!process.env.PYTHON_AI_URL) {
    throw new Error("PYTHON_AI_URL no está configurada");
  }

  const form = new FormData();
  form.append("file", fs.createReadStream(imagePath));
  form.append("bbox", JSON.stringify(bbox));
  form.append("label", label);

  const response = await axios.post(
    `${process.env.PYTHON_AI_URL.replace(/\/$/, "")}/segment-crop`,
    form,
    {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 90000,
    }
  );

  return response.data;
}

function getSegmentedBufferFromPythonResult(pyResult) {
  const base64 =
    pyResult?.image_base64 ||
    pyResult?.crop_base64 ||
    pyResult?.base64 ||
    null;

  if (!base64) return null;

  return Buffer.from(base64, "base64");
}

module.exports = {
  segmentClothesWithPythonCrop,
  getSegmentedBufferFromPythonResult,
};