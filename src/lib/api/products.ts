import { api } from "./client";

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image: string | null;
  available: boolean;
  storeId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductInput = {
  name: string;
  price: number;
  description?: string;
  image?: string;
  available?: boolean;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export async function getProducts(): Promise<Product[]> {
  const { data } = await api.get<{ products: Product[] }>("/products");
  return data.products;
}

export async function getProductById(id: string): Promise<Product> {
  const { data } = await api.get<{ product: Product }>(`/products/${id}`);
  return data.product;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const { data } = await api.post<{ product: Product }>("/products", input);
  return data.product;
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  const { data } = await api.put<{ product: Product }>(`/products/${id}`, input);
  return data.product;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}
