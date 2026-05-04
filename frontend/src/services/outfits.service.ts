//frontend/src/services/outfit.service.ts
import { API_URL } from "../api";

export async function getUserOutfits(userId: string) {
  const resp = await fetch(`${API_URL}/api/outfits/user/${userId}`);
  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(data?.error || "No se pudieron cargar los outfits");
  }

  return Array.isArray(data) ? data : [];
}

export interface OutfitPiece {
  id: number;
  imageUrl: string;
  type?: string | null;
  category?: string | null;
  color?: string | null;
  brand?: string | null;
  confidence?: number | null;
}

export interface GeneratedOutfitApi {
  type: "dress" | "separates";
  score: number;
  reason: string;
  pieces: OutfitPiece[];
}

export interface GenerateOutfitsResponse {
  success: boolean;
  count: number;
  outfits: GeneratedOutfitApi[];
}

export async function generateOutfits(params: {
  userId: string;
  occasion: string;
  weather: string;
  favoriteColors?: string[];
  dislikedColors?: string[];
}): Promise<GenerateOutfitsResponse> {
  const resp = await fetch(`${API_URL}/api/outfits/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(data?.error || "No se pudieron generar outfits");
  }

  return data as GenerateOutfitsResponse;
}