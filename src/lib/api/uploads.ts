import { api } from "./client";
import type { StoreProfile, User } from "./types";

export async function uploadAvatar(imageFile: File): Promise<{ avatar_url: string; user?: User }> {
  const formData = new FormData();
  formData.append("image", imageFile);

  const { data } = await api.post<{ avatar_url: string; user?: User }>("/upload/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function uploadStoreLogo(imageFile: File): Promise<{ logo_url: string; store?: StoreProfile }> {
  const formData = new FormData();
  formData.append("image", imageFile);

  const { data } = await api.post<{ logo_url: string; store?: StoreProfile }>("/upload/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}
