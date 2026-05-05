//frontend/src/services/outfit.service.ts
// frontend/src/services/outfits.service.ts

import { api } from "../api";
import { normalizeImageUrl } from "../utils/imageUrl";
import { normalizePrenda, Prenda } from "./clothingServie";

export interface OutfitItem {
  id?: number | string;
  prendaId?: number | string;
  prenda?: Prenda;
}

export interface Outfit {
  id: string;
  userId?: string;
  user_id?: string;
  name?: string | null;
  title?: string | null;
  occasion?: string | null;
  dressCode?: string | null;
  weather?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
  items?: OutfitItem[];
  prendas?: Prenda[];
  createdAt?: string;
  updatedAt?: string;
}

export function normalizeOutfit(outfit: any): Outfit {
  const rawImageUrl = outfit?.imageUrl || outfit?.image_url || null;

  const items = Array.isArray(outfit?.items)
    ? outfit.items.map((item: any) => ({
        ...item,
        prenda: item?.prenda ? normalizePrenda(item.prenda) : undefined,
      }))
    : Array.isArray(outfit?.outfitPrendas)
      ? outfit.outfitPrendas.map((item: any) => ({
          ...item,
          prenda: item?.prenda ? normalizePrenda(item.prenda) : undefined,
        }))
      : [];

  const prendas = Array.isArray(outfit?.prendas)
    ? outfit.prendas.map(normalizePrenda)
    : [];

  return {
    ...outfit,
    userId: outfit?.userId || outfit?.user_id,
    user_id: outfit?.user_id || outfit?.userId,
    imageUrl: normalizeImageUrl(rawImageUrl),
    image_url: normalizeImageUrl(rawImageUrl),
    items,
    prendas,
  };
}

export async function getUserOutfits(userId: string): Promise<Outfit[]> {
  const { data } = await api.get(`/api/outfits/user/${userId}`);

  const list = Array.isArray(data)
    ? data
    : data?.outfits || data?.items || data?.data || [];

  return Array.isArray(list) ? list.map(normalizeOutfit) : [];
}

export async function saveOutfit(payload: any): Promise<Outfit> {
  const { data } = await api.post("/api/outfits", payload);

  return normalizeOutfit(data?.outfit || data?.item || data);
}

export async function updateOutfit(id: string, payload: any): Promise<Outfit> {
  const { data } = await api.patch(`/api/outfits/${id}`, payload);

  return normalizeOutfit(data?.outfit || data?.item || data);
}

export async function deleteOutfit(id: string): Promise<any> {
  const { data } = await api.delete(`/api/outfits/${id}`);

  return data;
}

export async function generateOutfits(payload: any): Promise<Outfit[]> {
  const { data } = await api.post("/api/outfits/generate", payload);

  const list = Array.isArray(data)
    ? data
    : data?.outfits || data?.suggestions || data?.items || [];

  return Array.isArray(list) ? list.map(normalizeOutfit) : [];
}