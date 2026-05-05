// frontend/src/utils/imageUrl.ts

import { API_URL } from "../api";

export function normalizeImageUrl(rawUrl?: string | null): string | null {
  if (!rawUrl) return null;

  const clean = String(rawUrl).trim();

  if (!clean) return null;

  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }

  const cleanPath = clean.startsWith("/") ? clean : `/${clean}`;

  return `${API_URL}${cleanPath}`;
}

export function getImageSource(rawUrl?: string | null) {
  const normalized = normalizeImageUrl(rawUrl);

  if (!normalized) return null;

  return { uri: normalized };
}