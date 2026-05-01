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

const apiErrorMap: Record<string, string> = {
  PLAN_LIMIT_EXCEEDED: "Seu plano atingiu o limite de produtos.",
  WHATSAPP_NOT_SET: "Configure o WhatsApp da loja para receber pedidos.",
  STORE_NOT_FOUND: "Loja nao encontrada. Crie sua loja antes de continuar.",
  STORE_FORBIDDEN: "Voce nao tem permissao para acessar esta loja.",
  STORE_ID_REQUIRED: "Identificador da loja obrigatorio.",
  USER_NOT_FOUND: "Usuario nao encontrado.",
};

export function getApiErrorCode(err: unknown): string | undefined {
  const ax = err as AxiosError<ApiErrorBody>;
  const body = ax.response?.data;

  if (typeof body?.error_code === "string" && body.error_code.length > 0) {
    return body.error_code;
  }

  if (typeof body?.code === "string" && body.code.length > 0) {
    return body.code;
  }

  return undefined;
}

export function getApiErrorMessage(err: unknown): string {
  const ax = err as AxiosError<ApiErrorBody>;
  const code = getApiErrorCode(err);
  if (code && apiErrorMap[code]) {
    return apiErrorMap[code];
  }

  const msg = ax.response?.data?.message;
  if (typeof msg === "string" && msg.length > 0) return msg;
  if (ax.message) return ax.message;
  return "Erro inesperado. Tente novamente.";
}
