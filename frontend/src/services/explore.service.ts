// frontend/src/services/explore.service.ts

import { api } from "../api";
import { normalizeImageUrl } from "../utils/imageUrl";

export interface ExplorePost {
  id: string | number;
  userId?: string;
  user_id?: string;
  outfitId?: string | number | null;
  outfit_id?: string | number | null;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
  style?: string | null;
  likes?: number;
  saves?: number;
  commentsCount?: number;
  comments_count?: number;
  user?: {
    id?: string;
    name?: string | null;
    username?: string | null;
    email?: string | null;
    photoUrl?: string | null;
    photo_url?: string | null;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export function normalizeExplorePost(post: any): ExplorePost {
  const rawImageUrl = post?.imageUrl || post?.image_url || null;
  const rawUserPhoto = post?.user?.photoUrl || post?.user?.photo_url || null;

  return {
    ...post,
    userId: post?.userId || post?.user_id,
    user_id: post?.user_id || post?.userId,
    outfitId: post?.outfitId || post?.outfit_id,
    outfit_id: post?.outfit_id || post?.outfitId,
    imageUrl: normalizeImageUrl(rawImageUrl),
    image_url: normalizeImageUrl(rawImageUrl),
    commentsCount: post?.commentsCount ?? post?.comments_count ?? 0,
    comments_count: post?.comments_count ?? post?.commentsCount ?? 0,
    likes: post?.likes ?? 0,
    saves: post?.saves ?? 0,
    user: post?.user
      ? {
          ...post.user,
          photoUrl: normalizeImageUrl(rawUserPhoto),
          photo_url: normalizeImageUrl(rawUserPhoto),
        }
      : null,
  };
}

export async function getExplorePosts(): Promise<ExplorePost[]> {
  const { data } = await api.get("/api/explore");

  const list = Array.isArray(data)
    ? data
    : data?.posts || data?.items || data?.data || [];

  return Array.isArray(list) ? list.map(normalizeExplorePost) : [];
}

export async function createExplorePost(payload: any): Promise<ExplorePost> {
  const { data } = await api.post("/api/explore", payload);

  return normalizeExplorePost(data?.post || data?.item || data);
}

export async function likeExplorePost(postId: string | number): Promise<any> {
  const { data } = await api.post(`/api/explore/${postId}/like`);

  return data;
}

export async function commentExplorePost(
  postId: string | number,
  content: string
): Promise<any> {
  const { data } = await api.post(`/api/explore/${postId}/comments`, {
    content,
  });

  return data;
}

export async function deleteExplorePost(postId: string | number): Promise<any> {
  const { data } = await api.delete(`/api/explore/${postId}`);

  return data;
}