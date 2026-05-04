//frontend/src/services/clothingServie.ts
import { api, API_URL } from "../api";

export interface Prenda {
  id: number;
  userId: string;
  imageUrl: string;
  type?: string | null;
  color?: string | null;
  category?: string | null;
  brand?: string | null;
  confidence?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Detection {
  label: string;
  confidence: number;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

export interface UploadResult {
  success: boolean;
  message: string;
  count: number;
  items: Prenda[];
  detections: Detection[];
}

export async function uploadClothing(
  userId: string,
  imageUri: string,
  metadata?: { color?: string; brand?: string; type?: string }
): Promise<UploadResult> {
  const formData = new FormData();

  formData.append("userId", userId);
  if (metadata?.color) formData.append("color", metadata.color);
  if (metadata?.brand) formData.append("brand", metadata.brand);
  if (metadata?.type) formData.append("type", metadata.type);

  const filename = imageUri.split("/").pop() || "prenda.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const ext = match?.[1]?.toLowerCase() || "jpg";

  let mime = "image/jpeg";
  if (ext === "png") mime = "image/png";
  if (ext === "webp") mime = "image/webp";
  if (ext === "heic" || ext === "heif") mime = "image/jpeg";

  formData.append("image", {
    uri: imageUri,
    name: filename,
    type: mime,
  } as any);

  const resp = await fetch(`${API_URL}/api/clothes/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(data?.error || "Error al subir prenda");
  }

  return data as UploadResult;
}

export async function getUserClothes(userId: string): Promise<Prenda[]> {
  const r = await api.get(`/api/clothes/user/${userId}`);
  return Array.isArray(r.data) ? r.data : r.data?.prendas || [];
}