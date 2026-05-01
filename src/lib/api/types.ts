import { Store } from "./stores";

export type UserRole = "ADMIN" | "LOJISTA" | "CLIENTE" | string;
export type UserStatus = "ATIVO" | "INATIVO" | "BLOQUEADO" | string;

export type User = {
  id: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role?: UserRole;
  status?: UserStatus;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  store?: Store;
};

export type UserProfileUpdateInput = {
  name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
};

export type StoreAlertType =
  | "OVER_PRODUCT_LIMIT"
  | "PLAN_EXPIRING_SOON"
  | "WHATSAPP_NOT_SET"
  | string;

export type StoreAlertSeverity = "critical" | "warning" | "info" | string;

export type StoreAlert = {
  type: StoreAlertType;
  message: string;
  severity: StoreAlertSeverity;
};

export type StoreAddress = {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
};

export type StoreOpeningHours = Partial<
  Record<"seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom", string>
>;

export type StorePlanUsage = {
  id: string;
  name: string;
  max_products: number;
  used_products: number;
};

export type StoreProfile = {
  id: string;
  name: string;
  description?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  phone_whatsapp?: string | null;
  address?: StoreAddress | null;
  opening_hours?: StoreOpeningHours | null;
  is_open?: boolean;
  plan?: StorePlanUsage | null;
  alerts?: StoreAlert[];
};

export type StorePlanResponse = {
  plan: {
    id: string;
    name: string;
    max_products: number;
    price: string;
  };
  usage: {
    used_products: number;
    max_products: number;
    over_limit: boolean;
  };
};

export type StoreProfileUpdateInput = {
  name?: string;
  description?: string;
  logo_url?: string;
  phone_whatsapp?: string;
  primary_color?: string;
  is_open?: boolean;
  plan_id?: string;
  opening_hours?: StoreOpeningHours;
  address?: StoreAddress;
};

export type StoreHoursUpdateInput = {
  opening_hours: StoreOpeningHours;
};

export type StoreColorUpdateInput = {
  primary_color: string;
};

export type ApiErrorCode =
  | "PLAN_LIMIT_EXCEEDED"
  | "WHATSAPP_NOT_SET"
  | "STORE_NOT_FOUND"
  | "STORE_FORBIDDEN"
  | "STORE_ID_REQUIRED"
  | "USER_NOT_FOUND"
  | string;

export type AuthResponse = {
  user: User;
  accessToken: string;
  expiresIn: string;
};

export type ApiErrorBody = {
  error?: boolean;
  message?: string;
  code?: string | number;
  error_code?: ApiErrorCode;
  issues?: unknown;
};
