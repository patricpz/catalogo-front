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

type RawOrder = {
  id: string;
  total: number;
  whatsappLink?: string | null;
  whatsapp_link?: string | null;
  storeId?: string;
  store_id?: string;
  createdAt?: string;
  created_at?: string;
};

function normalizeOrder(order: RawOrder): Order {
  return {
    id: order.id,
    total: order.total,
    whatsappLink: order.whatsappLink ?? order.whatsapp_link ?? null,
    storeId: order.storeId ?? order.store_id ?? "",
    createdAt: order.createdAt ?? order.created_at ?? new Date().toISOString(),
  };
}

export async function createOrder(input: CreateOrderInput): Promise<{ order: Order }> {
  const { data } = await api.post<{ order: RawOrder }>("/orders", input);
  return { order: normalizeOrder(data.order) };
}

export async function getOrders(): Promise<Order[]> {
  const { data } = await api.get<{ orders: RawOrder[] }>("/orders");
  return data.orders.map(normalizeOrder);
}
