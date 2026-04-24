"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrders, type Order } from "@/lib/api/orders";
import Skeleton from "@/components/Skeleton";
import { Calendar, ChevronDown, ExternalLink } from "lucide-react";

export default function OrdersPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const ordersQuery = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: getOrders,
  });
  const orders = ordersQuery.data ?? [];
  const loading = ordersQuery.isLoading;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR");
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-8 lg:pl-10">
        <Skeleton className="h-10 w-40 mb-2" />
        <Skeleton className="h-4 w-64 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 lg:pl-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Pedidos</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Acompanhe os pedidos registrados.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--muted)]">
          <Calendar className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">Nenhum pedido ainda</p>
          <p className="text-sm mt-1">Quando clientes finalizarem pelo cart, os pedidos aparecerão aqui.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
              <p className="text-sm text-[var(--muted)]">Total</p>
              <p className="text-2xl font-bold mt-1">{orders.length}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
              <p className="text-sm text-[var(--muted)]">Receita</p>
              <p className="text-2xl font-bold mt-1">
                R$ {orders.reduce((s, o) => s + Number(o.total), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
              <p className="text-sm text-[var(--muted)]">Média</p>
              <p className="text-2xl font-bold mt-1">
                R$ {(orders.length > 0 ? orders.reduce((s, o) => s + Number(o.total), 0) / orders.length : 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
            <div className="hidden md:grid md:grid-cols-5 gap-4 px-6 py-3 border-b border-[var(--border)] bg-[var(--secondary)] text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              <div>ID</div>
              <div>Data</div>
              <div>Total</div>
              <div>Status</div>
              <div>Ação</div>
            </div>

            {orders.map((order) => (
              <div key={order.id} className="border-b border-[var(--border)]/50">
                <div
                  className="grid grid-cols-2 md:grid-cols-5 gap-4 px-6 py-4 items-center cursor-pointer md:hover:bg-[var(--secondary)]/30"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <div className="text-sm font-mono font-medium">#{order.id.slice(0, 8)}</div>
                  <div className="text-sm text-[var(--muted)] flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 hidden sm:inline" />
                    {formatDate(order.createdAt)}
                  </div>
                  <div className="text-sm font-semibold">
                    R$ {Number(order.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                  <div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {order.whatsappLink ? "Enviado" : "Registrado"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.whatsappLink && (
                      <a
                        href={order.whatsappLink}
                        target="_blank"
                        className="p-1 rounded bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        aria-label="WhatsApp"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <ChevronDown className={`h-4 w-4 transition-transform ${expanded === order.id ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
