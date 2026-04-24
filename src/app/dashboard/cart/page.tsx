"use client";

import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/contexts/toast-context";
import { useAuth } from "@/contexts/auth-context";
import { MessageCircle, Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui";

const STORE_PHONE = "5511999999999";
const STORE_NAME = "Minha Loja";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CartPage() {
  const { items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const { success, info } = useToast();
  const { isAuthenticated } = useAuth();

  function handleCheckoutWhatsApp() {
    if (items.length === 0) return info("Carrinho vazio", "Adicione itens antes de finalizar.");

    const now = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
    const lines = items.map((it) => {
      const subtotal = formatPrice(it.price * it.quantity);
      const unit = it.quantity > 1 ? ` _(${formatPrice(it.price)} cada)_` : "";
      return `• ${it.name} — ${it.quantity}x — *${subtotal}*${unit}`;
    });
    const itemCount = items.reduce((acc, it) => acc + it.quantity, 0);
    const total = formatPrice(totalPrice);

    const message = [
      `🛍️ *Novo Pedido — ${STORE_NAME}*`,
      ``,
      `📋 *Itens do pedido:*`,
      ...lines,
      ``,
      `━━━━━━━━━━━━━━`,
      `📦 Quantidade total: ${itemCount} ${itemCount === 1 ? "item" : "itens"}`,
      `💰 *Total: ${total}*`,
      ``,
      `_Pedido realizado em ${now}_`,
    ].join("\n");

    const url = `https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    success("Pedido enviado!", "Voce sera redirecionado ao WhatsApp.");
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Carrinho</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Revise seus itens e finalize pelo WhatsApp.</p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
            <ShoppingBag className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-xl font-semibold">Seu carrinho esta vazio</p>
            <p className="text-sm mt-2">Adicione produtos para comecar um pedido.</p>
            <a href={isAuthenticated ? "/dashboard/products" : "/catalog/minha-loja"} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] text-white px-6 py-2.5 text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors">
              <ShoppingBag className="h-4 w-4" />
              Ver produtos
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              {items.map((it) => (
                <div key={it.id} className="bg-white rounded-xl border border-[var(--border)] p-4 flex items-center gap-4 shadow-sm">
                  <div className="h-16 w-16 rounded-lg bg-[var(--secondary)] overflow-hidden shrink-0">
                    {it.image ? (
                      <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-[var(--muted)] opacity-30" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{it.name}</p>
                    <p className="text-sm text-[var(--accent)] font-semibold">{formatPrice(it.price)}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => updateQuantity(it.id, it.quantity - 1)}
                      className="h-7 w-7 rounded-md bg-[var(--secondary)] border flex items-center justify-center hover:bg-gray-100"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-7 text-center text-sm font-medium">{it.quantity}</span>
                    <button
                      onClick={() => updateQuantity(it.id, it.quantity + 1)}
                      className="h-7 w-7 rounded-md bg-[var(--secondary)] border flex items-center justify-center hover:bg-gray-100"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => { removeItem(it.id); success("Item removido", `${it.name} foi removido do carrinho.`); }}
                    className="text-[var(--muted)] hover:text-red-500 shrink-0"
                    aria-label="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <Button variant="ghost" size="sm" onClick={() => clearCart()} className="text-red-500">
                <Trash2 className="h-3.5 w-3.5" />
                Limpar carrinho
              </Button>
            </div>

            <div className="md:col-span-1">
              <div className="bg-white rounded-xl border border-[var(--border)] p-5 shadow-sm sticky top-24 space-y-4">
                <h3 className="font-semibold">Resumo</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted)]">Itens</span>
                  <span>{totalItems}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Total</span>
                  <span className="text-xl font-bold">{formatPrice(totalPrice)}</span>
                </div>
                <Button onClick={handleCheckoutWhatsApp} className="w-full gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] py-3">
                  <MessageCircle className="h-4 w-4" />
                  Finalizar no WhatsApp
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
