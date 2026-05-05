// // frontend/src/services/clothingServie.ts
// import { api, API_URL } from "../api";

// export interface Prenda {
//   id: number;
//   userId: string;
//   imageUrl: string;
//   type?: string | null;
//   color?: string | null;
//   category?: string | null;
//   brand?: string | null;
//   confidence?: number | null;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface Detection {
//   label: string;
//   confidence: number;
//   bbox?: {
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//   } | null;
// }

// export interface UploadResult {
//   success: boolean;
//   message: string;
//   count: number;
//   items: Prenda[];
//   detections: Detection[];
// }

// export interface UpdatePrendaPayload {
//   type?: string;
//   color?: string;
//   category?: string;
//   brand?: string;
// }

// export async function uploadClothing(
//   userId: string,
//   imageUri: string,
//   metadata?: { color?: string; brand?: string; type?: string }
// ): Promise<UploadResult> {
//   const formData = new FormData();

//   formData.append("userId", userId);

//   if (metadata?.color) formData.append("color", metadata.color);
//   if (metadata?.brand) formData.append("brand", metadata.brand);
//   if (metadata?.type) formData.append("type", metadata.type);

//   const filename = imageUri.split("/").pop() || "prenda.jpg";
//   const match = /\.(\w+)$/.exec(filename);
//   const ext = match?.[1]?.toLowerCase() || "jpg";

//   let mime = "image/jpeg";

//   if (ext === "png") mime = "image/png";
//   if (ext === "webp") mime = "image/webp";
//   if (ext === "heic" || ext === "heif") mime = "image/jpeg";

//   formData.append("image", {
//     uri: imageUri,
//     name: filename,
//     type: mime,
//   } as any);

//   const resp = await fetch(`${API_URL}/api/clothes/upload`, {
//     method: "POST",
//     body: formData,
//   });

//   const data = await resp.json();

//   if (!resp.ok) {
//     throw new Error(data?.error || "Error al subir prenda");
//   }

//   return data as UploadResult;
// }

// export async function getUserClothes(userId: string): Promise<Prenda[]> {
//   const r = await api.get(`/api/clothes/user/${userId}`);

//   return Array.isArray(r.data) ? r.data : r.data?.prendas || [];
// }

// export async function updateClothing(
//   clothingId: string,
//   payload: UpdatePrendaPayload
// ): Promise<Prenda> {
//   const { data } = await api.patch(`/api/clothes/${clothingId}`, payload);

//   return data?.prenda || data?.item || data;
// }

// export async function deleteClothing(clothingId: string): Promise<any> {
//   const { data } = await api.delete(`/api/clothes/${clothingId}`);

//   return data;
// }

// frontend/src/services/clothingServie.ts

// frontend/src/services/clothingServie.ts

import { api, API_URL } from "../api";
import { normalizeImageUrl } from "../utils/imageUrl";

export interface Prenda {
  id: number | string;
  userId?: string;
  user_id?: string;
  imageUrl?: string | null;
  image_url?: string | null;
  type?: string | null;
  color?: string | null;
  category?: string | null;
  brand?: string | null;
  confidence?: number | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
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
  detections?: Detection[];
}

export interface UpdatePrendaPayload {
  type?: string;
  color?: string;
  category?: string;
  brand?: string;
}

export function normalizePrenda(item: any): Prenda {
  const rawImageUrl = item?.imageUrl || item?.image_url || null;
  const normalizedUrl = normalizeImageUrl(rawImageUrl);

  return {
    ...item,
    id: item?.id,
    userId: item?.userId || item?.user_id,
    user_id: item?.user_id || item?.userId,
    imageUrl: normalizedUrl,
    image_url: normalizedUrl,
    type: item?.type ?? null,
    color: item?.color ?? null,
    category: item?.category ?? null,
    brand: item?.brand ?? null,
    confidence: item?.confidence ?? null,
    createdAt: item?.createdAt || item?.created_at,
    created_at: item?.created_at || item?.createdAt,
    updatedAt: item?.updatedAt || item?.updated_at,
    updated_at: item?.updated_at || item?.updatedAt,
  };
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

  const filename = imageUri.split("/").pop() || `prenda_${Date.now()}.jpg`;
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
    throw new Error(data?.error || data?.detail || "Error al subir prenda");
  }

  return {
    ...data,
    items: Array.isArray(data?.items)
      ? data.items.map(normalizePrenda)
      : [],
    detections: Array.isArray(data?.detections) ? data.detections : [],
  };
}

export async function getUserClothes(userId: string): Promise<Prenda[]> {
  const { data } = await api.get(`/api/clothes/user/${userId}`);

  const list = Array.isArray(data) ? data : data?.prendas || data?.items || [];

  return Array.isArray(list) ? list.map(normalizePrenda) : [];
}

export async function updateClothing(
  clothingId: string,
  payload: UpdatePrendaPayload
): Promise<Prenda> {
  const { data } = await api.patch(`/api/clothes/${clothingId}`, payload);

  return normalizePrenda(data?.prenda || data?.item || data);
}

export async function deleteClothing(clothingId: string): Promise<any> {
  const { data } = await api.delete(`/api/clothes/${clothingId}`);

  return data;
}