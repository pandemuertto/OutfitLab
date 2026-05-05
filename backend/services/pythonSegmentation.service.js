// backend/services/pythonSegmentation.service.js

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function segmentClothesWithPythonCrop(imagePath, bbox, label = "prenda") {
  const form = new FormData();
  form.append("file", fs.createReadStream(imagePath));
  form.append("bbox", JSON.stringify(bbox));
  form.append("label", label);

  const response = await axios.post(
    `${process.env.PYTHON_AI_URL}/segment-crop`,
    form,
    {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 60000,
    }
  );

  return response.data;
}

module.exports = { segmentClothesWithPythonCrop };