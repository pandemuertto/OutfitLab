// backend/utils/publicUrl.js

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

function toPublicUrl(req, rawUrl) {
  if (!rawUrl) return null;

  const clean = String(rawUrl).trim();

  if (!clean) return null;

  if (isAbsoluteUrl(clean)) return clean;

  const base = getBackendBaseUrl(req);
  const cleanPath = clean.startsWith("/") ? clean : `/${clean}`;

  return `${base}${cleanPath}`;
}

module.exports = {
  isAbsoluteUrl,
  getBackendBaseUrl,
  toPublicUrl,
};