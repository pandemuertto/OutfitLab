import { api } from '../api';

export interface Outfit {
  id: string;
  name?: string | null;
  occasion?: string | null;
  dressCode?: string | null;
  weather?: string | null;
  photoUrl?: string | null;
  items: Array<{
    prenda: {
      id: number;
      imageUrl: string;
      type?: string | null;
      color?: string | null;
      category?: string | null;
    }
  }>;
}

export async function getUserOutfits(userId: string): Promise<Outfit[]> {
  const response = await api.get(`/api/outfits/user/${userId}`);
  return response.data.outfits || [];
}