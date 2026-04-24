"use client";

import { useState } from "react";
import { Eye, Copy, Check, ExternalLink, Store } from "lucide-react";
import { Button } from "@/components/ui";
import { useToast } from "@/contexts/toast-context";

export default function CatalogPage() {
  const { success, info } = useToast();
  const storeSlug = "minha-loja";
  const [copied, setCopied] = useState(false);

  const storeUrl = typeof window !== "undefined" ? `${window.location.origin}/catalog/${storeSlug}` : "";

  function handleCopyStoreLink() {
    navigator.clipboard.writeText(storeUrl).then(() => {
      setCopied(true);
      success("Link copiado!", "Link da sua loja foi copiado para a area de transferencia.");
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      info("Link copiado!");
    });
  }

  return (
    <div className="p-4 sm:p-8 lg:pl-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Sua Loja Publica</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Configure e compartilhe o link do seu catalogo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview da loja */}
        <div className="rounded-xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[var(--border)]">
            <h3 className="font-semibold">Preview da vitrine</h3>
          </div>
          <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 min-h-[300px] flex items-center justify-center">
            <div className="text-center bg-white rounded-2xl shadow-lg p-8 w-72">
              <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-[var(--accent)] to-emerald-600 flex items-center justify-center">
                <Store className="h-8 w-8 text-white" />
              </div>
              <h4 className="mt-3 text-lg font-bold">Minha Loja</h4>
              <p className="text-sm text-[var(--muted)] mt-1">Confira os produtos disponiveis na minha loja!</p>
              <a
                href={`/catalog/${storeSlug}`}
                target="_blank"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:underline"
              >
                Ver catalogo completo
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Compartilhar */}
        <div className="rounded-xl border border-[var(--border)] bg-white shadow-sm p-6">
          <h3 className="font-semibold mb-4">Compartilhar loja</h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">URL da loja</label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={storeUrl}
                  className="flex-1 h-10 rounded-lg border border-[var(--border)] px-3 text-sm text-[var(--muted)] bg-[var(--secondary)]"
                />
                <Button onClick={handleCopyStoreLink} size="sm" className="gap-1 whitespace-nowrap">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado" : "Copiar"}
                </Button>
              </div>
            </div>

            {/* Preview de compartilhamento */}
            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-600" />
              <div className="bg-[var(--secondary)] p-3">
                <p className="text-sm text-[var(--muted)] italic truncate">{storeUrl}</p>
                <p className="text-sm font-semibold mt-0.5">Minha Loja - DevFlow</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                Dica para compartilhar
              </p>
              <p className="text-sm text-[var(--muted)]">
                Compartilhe o link da sua loja em grupos de WhatsApp, Instagram ou redes sociais.
                Seus clientes acessam, montam o carrinho e enviam o pedido diretamente para o seu WhatsApp.
              </p>
            </div>

            <a
              href={`/catalog/${storeSlug}`}
              target="_blank"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] text-white py-3 text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
            >
              <Eye className="h-4 w-4" />
              Abrir catalogo em nova aba
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
