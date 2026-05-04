const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function segmentClothesWithPython(imagePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(imagePath));

  const response = await axios.post(
    `${process.env.PYTHON_AI_URL}/segmentar`,
    form,
    {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 120000,
    }
  );

  return response.data;
}

module.exports = { segmentClothesWithPython };