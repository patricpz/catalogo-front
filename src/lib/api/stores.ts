import { api } from "./client";

export type Store = {
  id: string;
  name: string;
  slug: string;
  whatsappNumber: string | null;
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

export async function createStore(input: CreateStoreInput): Promise<Store> {
  const { data } = await api.post<{ store: Store }>("/stores", input);
  return data.store;
}

export async function getMyStore(): Promise<Store | null> {
  try {
    const { data } = await api.get<{ store: Store }>("/stores/me");
    return data.store;
  } catch {
    return null;
  }
}

export async function updateStore(input: UpdateStoreInput): Promise<Store> {
  const { data } = await api.put<{ store: Store }>("/stores", input);
  return data.store;
}

export async function deleteStore(): Promise<void> {
  await api.delete("/stores");
}

export async function getCatalogBySlug(slug: string): Promise<{ store: Store; products: CatalogProduct[] }> {
  const { data } = await api.get<{ store: Store & { products: CatalogProduct[] } }>(`/catalog/${slug}`);
  return { store: data.store, products: data.store.products };
}
