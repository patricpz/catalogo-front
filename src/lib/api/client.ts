import axios, { type AxiosError } from "axios";
import { getAuthToken } from "@/lib/auth/storage";
import type { ApiErrorBody } from "./types";

const configuredApiUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:5000";

// Aceita NEXT_PUBLIC_API_URL com ou sem /api, evitando chamadas para /api/api/*.
const baseURL = configuredApiUrl.endsWith("/api")
  ? configuredApiUrl.slice(0, -4)
  : configuredApiUrl;

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
  const code = ax.response?.data?.code;
  if (code === "STORE_NOT_FOUND") {
    return "Loja nao encontrada. Crie sua loja antes de cadastrar produtos.";
  }

  const msg = ax.response?.data?.message;
  if (typeof msg === "string" && msg.length > 0) return msg;
  if (ax.message) return ax.message;
  return "Erro inesperado. Tente novamente.";
}
