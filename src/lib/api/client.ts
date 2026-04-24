import axios, { type AxiosError } from "axios";
import { getAuthToken } from "@/lib/auth/storage";
import type { ApiErrorBody } from "./types";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:5000";

export const api = axios.create({
  baseURL: `${baseURL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiErrorMessage(err: unknown): string {
  const ax = err as AxiosError<ApiErrorBody>;
  const msg = ax.response?.data?.message;
  if (typeof msg === "string" && msg.length > 0) return msg;
  if (ax.message) return ax.message;
  return "Erro inesperado. Tente novamente.";
}
