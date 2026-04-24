"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, ChevronUp, ChevronDown, X, Store, MessageCircle, Minus, Plus, Copy, Check, Phone } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/contexts/toast-context";
import { Button } from "@/components/ui";
import Skeleton from "@/components/Skeleton";
import { getCatalogBySlug } from "@/lib/api/stores";
import { createOrder } from "@/lib/api/orders";
import { getApiErrorMessage } from "@/lib/api/client";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image: string | null;
  available: boolean;
};

export default function CatalogSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const [resolvedSlug, setResolvedSlug] = useState("");
  const { addItem, removeItem, updateQuantity, items, totalItems, totalPrice, clearCart } = useCart();
  const { success, error } = useToast();
  const [cartOpen, setCartOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const createOrderMutation = useMutation({
    mutationFn: createOrder,
  });

  useEffect(() => {
    params.then((p) => setResolvedSlug(p.slug));
  }, [params]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["catalog", resolvedSlug],
    queryFn: () => getCatalogBySlug(resolvedSlug),
    enabled: !!resolvedSlug,
    staleTime: 1000 * 60 * 5,
  });

  const store = data?.store ?? null;
  const products = data?.products ?? [];

  function handleAdd(p: CatalogProduct) {
    addItem({ id: p.id, name: p.name, price: p.price, image: p.image ?? undefined });
    setCartOpen(true);
  }

  async function handleCheckoutWhatsApp() {
    if (items.length === 0) return;
    try {
      const { order } = await createOrderMutation.mutateAsync({
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
      });

      if (order.whatsappLink) {
        window.open(order.whatsappLink, "_blank");
      }
      clearCart();
      success("Pedido enviado!", "Voce sera redirecionado ao WhatsApp.");
    } catch (err) {
      error("Erro ao criar pedido", getApiErrorMessage(err));
    }
  }

  function handleCopyShare() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      success("Link copiado!", "Compartilhe o link da vitrine.");
      setTimeout(() => setIsCopied(false), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Store Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {loading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                  {store?.name?.charAt(0).toUpperCase() || "L"}
                </div>
                <div>
                  <h1 className="text-base font-bold leading-tight">{store?.name || "Loja"}</h1>
                  {store?.whatsappNumber && (
                    <p className="text-[10px] text-[var(--muted)] flex items-center gap-0.5">
                      <Phone className="h-2.5 w-2.5" />
                      {store.whatsappNumber}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            <button onClick={handleCopyShare} className="p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors" aria-label="Compartilhar">
              {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Products */}
      <main className="container mx-auto px-4 py-8 pb-32">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">Nossos Produtos</h2>
          <p className="text-sm text-[var(--muted)] mt-1">Escolha seus produtos e envie o pedido pelo WhatsApp</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
            <Store className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-xl font-semibold">Loja sem produtos</p>
            <p className="text-sm mt-2">Os produtos aparecerão aqui quando forem cadastrados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.filter((p) => p.available !== false).map((p) => (
              <div key={p.id} className="rounded-xl border border-[var(--border)] bg-white overflow-hidden shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 flex flex-col">
                <div className="h-44 w-full bg-[var(--secondary)] overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Store className="h-10 w-10 text-[var(--muted)] opacity-30" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-sm font-semibold leading-snug">{p.name}</h3>
                  {p.description && (
                    <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{p.description}</p>
                  )}
                  <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                    <span className="text-lg font-bold text-[var(--accent)]">
                      {formatPrice(p.price)}
                    </span>
                    <Button onClick={() => handleAdd(p)} size="sm" className="gap-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)]">
                      <Plus className="h-3.5 w-3.5" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {totalItems > 0 && (
        <aside
          className={`fixed bottom-0 left-0 z-50 w-full bg-white border-t border-[var(--border)] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 ease-in-out sm:bottom-6 sm:left-auto sm:right-6 sm:w-96 sm:rounded-2xl sm:border sm:shadow-xl ${
            cartOpen ? "translate-y-0" : "translate-y-[calc(100%-72px)]"
          }`}
        >
          <div className="flex items-center justify-between p-4 cursor-pointer sm:cursor-default" onClick={() => setCartOpen(!cartOpen)}>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-[var(--foreground)]" />
              <h3 className="text-lg font-semibold">
                Carrinho <span className="text-sm font-normal text-[var(--muted)]">({totalItems} {totalItems === 1 ? "item" : "itens"})</span>
              </h3>
            </div>
            <div className="sm:hidden">
              {cartOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="space-y-3 max-h-[35vh] sm:max-h-60 overflow-y-auto mb-4">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-3 bg-[var(--secondary)] p-3 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{it.name}</p>
                    <p className="text-xs text-[var(--muted)]">Qtd: {it.quantity}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(it.id, it.quantity - 1); }} className="h-7 w-7 rounded-md bg-white border flex items-center justify-center hover:bg-gray-50">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-7 text-center text-sm font-medium">{it.quantity}</span>
                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(it.id, it.quantity + 1); }} className="h-7 w-7 rounded-md bg-white border flex items-center justify-center hover:bg-gray-50">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeItem(it.id); }} className="text-[var(--muted)] hover:text-red-500 shrink-0" aria-label="Remover">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[var(--muted)]">Total</span>
              <span className="text-lg font-bold">{formatPrice(totalPrice)}</span>
            </div>
            <Button onClick={(e) => { e.stopPropagation(); void handleCheckoutWhatsApp(); }} disabled={createOrderMutation.isPending} className="w-full gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] py-3 text-sm">
              <MessageCircle className="h-4 w-4" />
              {createOrderMutation.isPending ? "Enviando..." : "Finalizar no WhatsApp"}
            </Button>
          </div>
        </aside>
      )}
    </div>
  );
}
