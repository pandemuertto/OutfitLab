const fs = require("fs").promises;
const path = require("path");

async function importSegmentedFileToUploads(sourceFilePath) {
  const uploadsDir = path.join(__dirname, "..", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(sourceFilePath) || ".png";
  const filename = `seg_${Date.now()}_${Math.floor(Math.random() * 100000)}${ext}`;
  const destination = path.join(uploadsDir, filename);

  await fs.copyFile(sourceFilePath, destination);

  return {
    filename,
    relativeUrl: `/uploads/${filename}`,
    absolutePath: destination,
  };
}

module.exports = { importSegmentedFileToUploads };