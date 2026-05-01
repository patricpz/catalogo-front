import { api } from "./client";
import type { User, UserProfileUpdateInput } from "./types";

export async function getUserProfile(): Promise<User> {
  const { data } = await api.get<{ user: User }>("/user/profile");
  return data.user;
}

export async function updateUserProfile(input: UserProfileUpdateInput): Promise<User> {
  const { data } = await api.put<{ user: User }>("/user/profile", input);
  return data.user;
}
