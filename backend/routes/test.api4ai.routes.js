const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { detectClothesWithApi4AI } = require('../services/api4aiFashion.service');

const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

router.post('/test-api4ai', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: 'No se envió ninguna imagen en el campo image',
      });
    }

    const detections = await detectClothesWithApi4AI(req.file.path);

    return res.json({
      ok: true,
      file: req.file.filename,
      detections,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
      detail: error.response?.data || null,
    });
  }
});

module.exports = router;