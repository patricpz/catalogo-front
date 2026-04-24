"use client";

import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import Skeleton from "@/components/Skeleton";
import { Package, ShoppingCart, TrendingUp, Copy, ExternalLink } from "lucide-react";
import { useStore } from "@/hooks/useStore";

const statCards = [
  { label: "Produtos ativos", value: 0, icon: Package, color: "text-green-600 bg-green-50", change: "+2 esta semana" },
  { label: "Pedidos hoje", value: 0, icon: ShoppingCart, color: "text-blue-600 bg-blue-50", change: "0 novos" },
  { label: "Vendas do mes", value: "R$ 0", icon: TrendingUp, color: "text-purple-600 bg-purple-50", change: "Aguardando vendas" },
];

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const { info } = useToast();
  const storeQuery = useStore()
  const store = storeQuery.data ?? user?.store ?? null;
  const storeUrl = typeof window !== "undefined"
    ? `${window.location.origin}/catalog/${store?.slug || "minha-loja"}`
    : "";
    console.log("User store:", store);

  function handleCopyLink() {
    navigator.clipboard.writeText(storeUrl).then(() => {
      info("Link copiado!", "Compartilhe com seus clientes.");
    }).catch(() => {
      info("Link copiado!");
    });
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8 lg:pl-10">
        <Skeleton className="h-10 w-60 mb-2" />
        <Skeleton className="h-4 w-80 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 lg:pl-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Ola, {user?.email?.split("@")[0] || "Vendedor"}!</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Aqui esta o resumo da sua loja.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--secondary)] transition-colors"
          >
            <Copy className="h-4 w-4" />
            Copiar link da loja
          </button>
          <a
            href={storeUrl}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] text-white px-4 py-2 text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Ver loja publica
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color.split(" ")[1]}`}>
                <s.icon className={`h-5 w-5 ${s.color.split(" ")[0]}`} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold">{s.value}</div>
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-lg">Ultimo pedido</h3>
          <div className="mt-4 flex h-48 items-center justify-center rounded-xl bg-[var(--secondary)] text-[var(--muted)] text-sm">
            Nenhum pedido recente
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-lg">Dados da loja</h3>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted)]">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted)]">ID</span>
              <span className="font-medium">{user?.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted)]">Slug da loja</span>
              <span className="font-mono text-xs bg-[var(--secondary)] px-2 py-0.5 rounded">minha-loja</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
