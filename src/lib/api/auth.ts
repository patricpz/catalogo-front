import { api } from "./client";
import type { AuthResponse, User } from "./types";

export async function register(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", { email, password });
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data;
}

export async function fetchMe(): Promise<{ user: User }> {
  try {
    const { data } = await api.get<{ user: User }>("/user/profile");
    return data;
  } catch {
    const { data } = await api.get<{ user: User }>("/auth/me");
    return data;
  }
}
