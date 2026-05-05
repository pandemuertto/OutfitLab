// backend/services/supabaseStorage.service.js
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "closi-images";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "⚠️ Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. Storage no funcionará."
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function sanitizeFileName(name) {
  return String(name || "image")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";

  return "image/jpeg";
}

async function uploadLocalFileToSupabase({
  localPath,
  folder = "uploads",
  userId = "general",
  fileName,
}) {
  if (!localPath || !fs.existsSync(localPath)) {
    throw new Error(`Archivo local no existe: ${localPath}`);
  }

  const safeName = sanitizeFileName(fileName || path.basename(localPath));
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;
  const storagePath = `${folder}/${userId}/${uniqueName}`;

  const buffer = fs.readFileSync(localPath);
  const contentType = getMimeType(localPath);

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Error subiendo archivo a Supabase: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  return {
    storagePath,
    publicUrl: data.publicUrl,
  };
}

async function uploadBufferToSupabase({
  buffer,
  folder = "uploads",
  userId = "general",
  fileName = "image.png",
  contentType = "image/png",
}) {
  if (!buffer) {
    throw new Error("No se recibió buffer para subir");
  }

  const safeName = sanitizeFileName(fileName);
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;
  const storagePath = `${folder}/${userId}/${uniqueName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Error subiendo buffer a Supabase: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  return {
    storagePath,
    publicUrl: data.publicUrl,
  };
}

module.exports = {
  uploadLocalFileToSupabase,
  uploadBufferToSupabase,
};