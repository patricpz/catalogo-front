"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, ChevronUp, ChevronDown, X, Store, MessageCircle, Minus, Plus, Copy, Check, Phone, Clock, Star, ChevronRight } from "lucide-react";
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
  const [logoLoadError, setLogoLoadError] = useState(false);
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
  const storeInitial = store?.name?.trim()?.charAt(0).toUpperCase() || "E";
  const storeLogo = ((store as { logo?: string | null } | null)?.logo ?? "").trim();

  useEffect(() => {
    setLogoLoadError(false);
  }, [storeLogo]);

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

            </>
          )}
        </div>
      </header>

<div className="min-h-screen bg-white">

      <header className="px-4 pb-4 relative flex flex-col items-center">
        {/* Logo Circular - Margem negativa para subir na capa */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white bg-white flex items-center justify-center shadow-sm overflow-hidden -mt-10 sm:-mt-12 relative z-10">
          {storeLogo && !logoLoadError ? (
            <img
              src={storeLogo}
              alt={store?.name || "Logo da loja"}
              className="w-full h-full object-cover"
              onError={() => setLogoLoadError(true)}
            />
          ) : (
            <span className="text-[var(--accent)] font-bold text-3xl">
              {storeInitial}
            </span>
          )}
        </div>

        {/* Nome da Loja */}
        <h1 className="text-xl sm:text-2xl font-bold leading-tight mt-2 text-[var(--foreground)] text-center">
          {store?.name || "esfiha da vovó"}
        </h1>

        {/* Status (Aberto/Fechado) */}
        <span className="mt-1.5 px-3 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          Aberto
        </span>

      </header>

      <nav className="sticky top-0 bg-white z-30 border-b border-[var(--border)] mt-2">
        <ul className="flex overflow-x-auto whitespace-nowrap px-4 hide-scrollbar">
          {["combo mais vendido", "PROMOÇÃO", "Esfihas Abertas", "PIZZA G", "BROTINHO", "Bebidas"].map((cat, idx) => (
            <li key={cat} className="mr-6 last:mr-0 shrink-0">
              <button 
                className={`py-3 text-sm font-medium uppercase tracking-wide border-b-2 transition-colors ${
                  idx === 0 
                    ? "border-[var(--accent)] text-[var(--foreground)]" 
                    : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main className="container mx-auto py-6 pb-36 space-y-8">
        
        {/* Categoria: Destaque / Mais Vendidos */}
        <section>
          <div className="flex items-center justify-between px-4 mb-4">
            <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-500 fill-blue-500" />
              combo mais vendido
            </h2>
            <button className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] flex items-center">
              Ver todos <ChevronRight className="h-4 w-4 ml-0.5" />
            </button>
          </div>

          {loading ? (
            <div className="flex overflow-x-auto gap-4 px-4 pb-4 hide-scrollbar">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-[140px] h-[200px] shrink-0 rounded-xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-[var(--muted)]">
              <Store className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm">Nenhum produto encontrado.</p>
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-4 px-4 pb-4 hide-scrollbar">
              {products.filter((p) => p.available !== false).map((p) => (
                <div 
                  key={p.id} 
                  className="w-[140px] sm:w-[160px] shrink-0 flex flex-col group cursor-pointer active:scale-95 transition-transform"
                  onClick={() => handleAdd(p)}
                >
                  {/* Imagem do Produto */}
                  <div className="w-full aspect-square rounded-xl bg-gray-100 overflow-hidden mb-2 border border-black/5 relative">
                    {p.image ? (
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Store className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                    {/* Botão rápido sobre a imagem (opcional, estilo iFood) */}
                    <button 
                      className="absolute bottom-2 right-2 h-8 w-8 bg-white rounded-full shadow flex items-center justify-center text-[var(--accent)] hover:bg-gray-50"
                      onClick={(e) => {
                        e.stopPropagation(); // Evita clicar no card duas vezes
                        handleAdd(p);
                      }}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Detalhes do Produto */}
                  <h3 className="text-sm font-semibold leading-tight line-clamp-2 text-[var(--foreground)] mb-1">
                    {p.name}
                  </h3>
                  {p.description && (
                    <p className="text-[10px] text-[var(--muted)] line-clamp-1 mb-1">
                      {p.description}
                    </p>
                  )}
                  <span className="text-sm font-bold mt-auto text-[var(--foreground)]">
                    {formatPrice(p.price)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
        

      </main>

      {/* ================= GAVETA DO CARRINHO ================= */}
      {totalItems > 0 && (
        <aside
          className={`fixed bottom-0 left-0 z-50 w-full bg-white border-t border-[var(--border)] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out sm:bottom-6 sm:left-auto sm:right-6 sm:w-96 sm:rounded-2xl sm:border sm:shadow-xl ${
            cartOpen ? "translate-y-0" : "translate-y-[calc(100%-72px)]"
          }`}
        >
          {/* Header do Carrinho (Clique para abrir/fechar) */}
          <div 
            className="flex items-center justify-between p-4 cursor-pointer select-none active:bg-gray-50 transition-colors" 
            onClick={() => setCartOpen(!cartOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-[var(--foreground)]" />
                <span className="absolute -top-2 -right-2 bg-[var(--accent)] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              </div>
              <h3 className="text-base font-semibold">
                Seu Carrinho
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-[var(--foreground)] sm:hidden">
                {formatPrice(totalPrice)}
              </span>
              <div className="bg-[var(--secondary)] rounded-full p-1">
                {cartOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </div>
            </div>
          </div>

          {/* Lista de Itens do Carrinho (Exibida apenas quando aberto) */}
          <div className="px-4 pb-4 pb-safe">
            <div className="space-y-3 max-h-[40vh] sm:max-h-60 overflow-y-auto mb-4 hide-scrollbar">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-3 bg-[var(--secondary)] p-3 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-[var(--foreground)]">{it.name}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{formatPrice(it.price * it.quantity)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 bg-white rounded-lg border p-1 shadow-sm">
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateQuantity(it.id, it.quantity - 1); }} 
                      className="h-6 w-6 rounded-md flex items-center justify-center text-[var(--foreground)] active:bg-gray-100"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-4 text-center text-xs font-semibold">{it.quantity}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateQuantity(it.id, it.quantity + 1); }} 
                      className="h-6 w-6 rounded-md flex items-center justify-center text-[var(--foreground)] active:bg-gray-100"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeItem(it.id); }} 
                    className="text-[var(--muted)] hover:text-red-500 p-2 shrink-0" 
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="border-t border-[var(--border)] pt-4 pb-2">
              <div className="flex items-center justify-between mb-4 hidden sm:flex">
                <span className="text-sm text-[var(--muted)]">Total</span>
                <span className="text-xl font-bold">{formatPrice(totalPrice)}</span>
              </div>
              <Button 
                onClick={(e) => { e.stopPropagation(); void handleCheckoutWhatsApp(); }} 
                disabled={createOrderMutation?.isPending} 
                className="w-full h-12 text-base font-medium shadow-md gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-xl"
              >
                <MessageCircle className="h-5 w-5" />
                {createOrderMutation?.isPending ? "Processando..." : "Pedir pelo WhatsApp"}
              </Button>
            </div>
          </div>
        </aside>
      )}
    </div>


    </div>
  );
}
