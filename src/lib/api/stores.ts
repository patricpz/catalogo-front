import { api } from "./client";
import type {
  StoreAlert,
  StoreColorUpdateInput,
  StoreHoursUpdateInput,
  StorePlanResponse,
  StoreProfile,
  StoreProfileUpdateInput,
} from "./types";

export type Store = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  whatsappNumber: string | null;
  phoneWhatsapp?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  openingHours?: Record<string, string> | null;
  isOpen?: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateStoreInput = {
  name: string;
  whatsappNumber?: string;
};

export type UpdateStoreInput = Partial<CreateStoreInput>;

export type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image: string | null;
  available: boolean;
  createdAt: string;
  updatedAt: string;
};

type RawStore = {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  whatsappNumber?: string | null;
  whatsapp_number?: string | null;
  phoneWhatsapp?: string | null;
  phone_whatsapp?: string | null;
  logoUrl?: string | null;
  logo_url?: string | null;
  primaryColor?: string | null;
  primary_color?: string | null;
  openingHours?: Record<string, string> | null;
  opening_hours?: Record<string, string> | null;
  isOpen?: boolean;
  is_open?: boolean;
  userId?: string;
  user_id?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  products?: CatalogProduct[];
};

function normalizeStore(raw: RawStore): Store {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug ?? "",
    description: raw.description ?? null,
    whatsappNumber: raw.whatsappNumber ?? raw.whatsapp_number ?? raw.phoneWhatsapp ?? raw.phone_whatsapp ?? null,
    phoneWhatsapp: raw.phoneWhatsapp ?? raw.phone_whatsapp ?? raw.whatsappNumber ?? raw.whatsapp_number ?? null,
    logoUrl: raw.logoUrl ?? raw.logo_url ?? null,
    primaryColor: raw.primaryColor ?? raw.primary_color ?? null,
    openingHours: raw.openingHours ?? raw.opening_hours ?? null,
    isOpen: raw.isOpen ?? raw.is_open,
    userId: raw.userId ?? raw.user_id ?? "",
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? raw.updated_at ?? new Date().toISOString(),
  };
}

export async function createStore(input: CreateStoreInput): Promise<Store> {
  const { data } = await api.post<{ store: RawStore }>("/stores", input);
  return normalizeStore(data.store);
}

export async function getMyStore(): Promise<Store | null> {
  try {
    const { data } = await api.get<{ store: RawStore }>("/stores/me");
    return normalizeStore(data.store);
  } catch {
    return null;
  }
}

export async function updateStore(input: UpdateStoreInput): Promise<Store> {
  const { data } = await api.put<{ store: RawStore }>("/stores", input);
  return normalizeStore(data.store);
}

export async function deleteStore(): Promise<void> {
  await api.delete("/stores");
}

export async function getCatalogBySlug(slug: string): Promise<{ store: Store; products: CatalogProduct[] }> {
  const { data } = await api.get<{ store: RawStore }>(`/catalog/${slug}`);
  return { store: normalizeStore(data.store), products: data.store.products ?? [] };
}

export async function getStoreProfile(storeId: string): Promise<StoreProfile> {
  const { data } = await api.get<StoreProfile>(`/store/${encodeURIComponent(storeId)}`);
  return data;
}

export async function updateStoreProfile(storeId: string, input: StoreProfileUpdateInput): Promise<StoreProfile> {
  const { data } = await api.put<StoreProfile>(`/store/${encodeURIComponent(storeId)}`, input);
  return data;
}

export async function updateStoreHours(storeId: string, input: StoreHoursUpdateInput): Promise<StoreProfile> {
  const { data } = await api.put<StoreProfile>(`/store/${encodeURIComponent(storeId)}/hours`, input);
  return data;
}

export async function updateStoreColor(storeId: string, input: StoreColorUpdateInput): Promise<StoreProfile> {
  const { data } = await api.put<StoreProfile>(`/store/${encodeURIComponent(storeId)}/color`, input);
  return data;
}

export async function getStoreAlerts(storeId: string): Promise<StoreAlert[]> {
  const { data } = await api.get<{ alerts?: StoreAlert[] } | StoreAlert[]>(`/store/${encodeURIComponent(storeId)}/alerts`);

  if (Array.isArray(data)) return data;
  return data.alerts ?? [];
}

export async function getStorePlan(storeId: string): Promise<StorePlanResponse> {
  const { data } = await api.get<StorePlanResponse>(`/store/${encodeURIComponent(storeId)}/plan`);
  return data;
}
