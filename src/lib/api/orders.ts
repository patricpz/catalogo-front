import { api } from "./client";

export type OrderItemInput = {
  productId: string;
  quantity: number;
};

export type CreateOrderInput = {
  items: OrderItemInput[];
};

export type Order = {
  id: string;
  total: number;
  whatsappLink: string | null;
  storeId: string;
  createdAt: string;
};

export async function createOrder(input: CreateOrderInput): Promise<{ order: Order }> {
  const { data } = await api.post<{ order: Order }>("/orders", input);
  return data;
}

export async function getOrders(): Promise<Order[]> {
  const { data } = await api.get<{ orders: Order[] }>("/orders");
  return data.orders;
}
