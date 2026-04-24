"use client";

import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, ChevronUp, ChevronDown, X, Store, MessageCircle, Minus, Plus, Copy, Check } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/contexts/toast-context";
import { Button } from "@/components/ui";

const STORE_NAME = "DevFlow Demo";
const STORE_PHONE = "5511999999999";

type DemoProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
};

const demoProducts: DemoProduct[] = [
  { id: "d1", name: "Camiseta DevFlow", price: 49.9, description: "100% algodao organico, estampa exclusiva", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=300&fit=crop" },
  { id: "d2", name: "Caneca Tech", price: 35.0, description: "Caneca de ceramica 350ml com frase geek", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=300&fit=crop" },
  { id: "d3", name: "Adesivo Pack", price: 15.0, description: "10 adesivos de tecnologia, material vinil", image: "https://images.unsplash.com/photo-1572375992501-8b14db77c2c7?w=400&h=300&fit=crop" },
  { id: "d4", name: "Mousepad XL", price: 59.9, description: "Mousepad grande 90x40cm, borda costurada", image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&h=300&fit=crop" },
  { id: "d5", name: "Boné Dev", price: 42.0, description: "Aba curva, bordado com logo da plataforma", image: undefined },
  { id: "d6", name: "Moletom Hacker", price: 89.9, description: "Moletom com capuz e canguru, estampa minimal" },
];

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function DemoCatalogPage() {
  const { items, addItem, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const { success, info } = useToast();
  const [cartOpen, setCartOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  function handleAdd(p: DemoProduct) {
    addItem({ id: p.id, name: p.name, price: p.price, image: p.image });
    setCartOpen(true);
    success("Adicionado!", `${p.name} foi adicionado ao carrinho.`);
  }

  function handleCheckoutWhatsApp() {
    if (items.length === 0) return;

    const lines = items.map((it) => `• ${it.name} (${it.quantity}x) — ${formatPrice(it.price)}`);
    const total = formatPrice(totalPrice);
    const message = `*Pedido — ${STORE_NAME}*\n\n${lines.join("\n")}\n\n*Total: ${total}*`;
    const url = `https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
    success("Pedido enviado!", "Voce sera redirecionado ao WhatsApp.");
  }

  function handleCopyShare() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      success("Link copiado!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-emerald-600 flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">{STORE_NAME}</h1>
              <p className="text-[10px] text-[var(--muted)]">Catalogo de demonstracao</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopyShare} className="p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors" aria-label="Compartilhar">
              {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </button>
            <a href="/dashboard/cart" className="relative p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </a>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-8 sm:py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Catalogo de Demonstracao</h2>
          <p className="mt-2 text-emerald-100 max-w-lg mx-auto">
            Veja como seus clientes veriam seus produtos. Adicione itens ao carrinho e teste o pedido via WhatsApp.
          </p>
        </div>
      </div>

      {/* Products */}
      <main className="container mx-auto px-4 py-8 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {demoProducts.map((p) => (
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
                <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{p.description}</p>
                <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                  <span className="text-lg font-bold text-[var(--accent)]">
                    {formatPrice(p.price)}
                  </span>
                  <Button onClick={() => addItem({ id: p.id, name: p.name, price: p.price, image: p.image })} size="sm" className="gap-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)]">
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Drawer */}
      {totalItems > 0 && (
        <aside
          className={`fixed bottom-0 left-0 z-50 w-full bg-white border-t border-[var(--border)] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 sm:bottom-6 sm:left-auto sm:right-6 sm:w-96 sm:rounded-2xl sm:border sm:shadow-xl ${
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
            <div className="sm:hidden">{cartOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}</div>
          </div>

          <div className="px-4 pb-4">
            <div className="space-y-3 max-h-[35vh] sm:max-h-60 overflow-y-auto mb-4">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-3 bg-[var(--secondary)] p-3 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{it.name}</p>
                    <p className="text-xs text-[var(--muted)]">{formatPrice(it.price)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(it.id, (it.quantity || 1) - 1); }} className="h-7 w-7 rounded-md bg-white border flex items-center justify-center hover:bg-gray-50">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-7 text-center text-sm font-medium">{it.quantity || 1}</span>
                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(it.id, (it.quantity || 1) + 1); }} className="h-7 w-7 rounded-md bg-white border flex items-center justify-center hover:bg-gray-50">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeItem(it.id); }} className="text-[var(--muted)] hover:text-red-500" aria-label="Remover">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[var(--muted)]">Total</span>
              <span className="text-lg font-bold">{formatPrice(totalPrice)}</span>
            </div>

            <Button onClick={(e) => { e.stopPropagation(); handleCheckoutWhatsApp(); }} className="w-full gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] py-3">
              <MessageCircle className="h-4 w-4" />
              Finalizar no WhatsApp
            </Button>
          </div>
        </aside>
      )}

      {/* Floating cart button when cart is closed */}
      {totalItems > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[var(--accent)] text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:bg-[var(--accent-hover)] transition-colors sm:hidden"
        >
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
