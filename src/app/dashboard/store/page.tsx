"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/contexts/toast-context";
import { createStore, getMyStore, updateStore, type Store } from "@/lib/api/stores";
import { getApiErrorMessage } from "@/lib/api/client";
import Input from "@/components/ui/Input";
import { Button } from "@/components/ui";
import Skeleton from "@/components/Skeleton";
import { Store as StoreIcon, Copy, ExternalLink, Check } from "lucide-react";

function formatPhone(raw: string) {
  // Accept formats: raw number or +55XXXXXXXXXXX
  return raw.replace(/[^\d+]/g, "");
}

export default function StoreSetupPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [copied, setCopied] = useState(false);
  const storeQuery = useQuery<Store | null>({
    queryKey: ["store", "me"],
    queryFn: getMyStore,
  });
  const store = storeQuery.data ?? null;

  useEffect(() => {
    if (store) {
      setName(store.name);
      setWhatsapp(store.whatsappNumber || "");
    }
  }, [store]);

  const createStoreMutation = useMutation({
    mutationFn: createStore,
    onSuccess: (created) => {
      queryClient.setQueryData(["store", "me"], created);
      success("Loja criada!", `"${created.name}" esta pronta. Slug: ${created.slug}`);
    },
    onError: (err: unknown) => {
      toastError("Erro ao criar loja", getApiErrorMessage(err));
    },
  });

  const updateStoreMutation = useMutation({
    mutationFn: updateStore,
    onSuccess: (updated) => {
      queryClient.setQueryData(["store", "me"], updated);
      success("Loja atualizada!");
    },
    onError: (err: unknown) => {
      toastError("Erro ao atualizar", getApiErrorMessage(err));
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toastError("Nome obrigatorios", "Informe o nome da sua loja.");

    const input = {
      name: name.trim(),
      whatsappNumber: whatsapp.trim() || undefined,
    };
    createStoreMutation.mutate(input);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!store) return;

    updateStoreMutation.mutate({
      name: name.trim(),
      whatsappNumber: whatsapp.trim() || undefined,
    });
  }

  function handleCopyLink() {
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/catalog/${store?.slug || "minha-loja"}`
      : "";
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  const storeUrl = typeof window !== "undefined" && store
    ? `${window.location.origin}/catalog/${store.slug}`
    : "";
  const submitting = createStoreMutation.isPending || updateStoreMutation.isPending;

  if (storeQuery.isLoading) {
    return (
      <div className="p-4 sm:p-8 lg:pl-10">
        <Skeleton className="h-10 w-60 mb-2" />
        <Skeleton className="h-4 w-80 mb-8" />
        <div className="max-w-lg space-y-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 lg:pl-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Sua Loja</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          {store ? "Gerencie as configuracoes da sua loja." : "Crie sua loja para comecar a vender."}
        </p>
      </div>

      <div className="max-w-lg space-y-6">
        {!store ? (
          /* =========== CRIAR LOJA =========== */
          <div className="rounded-xl border border-[var(--border)] bg-white shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--accent)] to-emerald-700 flex items-center justify-center">
                <StoreIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Criar sua loja</h3>
                <p className="text-xs text-[var(--muted)]">Escolha um nome unico para o URL da sua loja.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nome da loja"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Lojinha da Maria"
              />
              <Input
                label="WhatsApp com DDD (opcional)"
                value={formatPhone(whatsapp)}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: 5511999999999"
              />
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] gap-2"
              >
                <StoreIcon className="h-4 w-4" />
                {submitting ? "Criando..." : "Criar minha loja"}
              </Button>
            </form>
          </div>
        ) : (
          /* =========== EDITAR LOJA =========== */
          <>
            <div className="rounded-xl border border-[var(--border)] bg-white shadow-sm p-6">
              <form onSubmit={handleUpdate} className="space-y-4">
                <Input
                  label="Nome da loja"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Lojinha da Maria"
                />
                <Input
                  label="WhatsApp com DDD"
                  value={formatPhone(whatsapp)}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ex: 5511999999999"
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
                >
                  {submitting ? "Salvando..." : "Salvar alteracoes"}
                </Button>
              </form>
            </div>

            {/* Link da loja */}
            <div className="rounded-xl border border-[var(--border)] bg-white shadow-sm p-6">
              <h3 className="font-semibold mb-3">Link da loja</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={storeUrl}
                  className="flex-1 h-10 rounded-lg border border-[var(--border)] px-3 text-sm text-[var(--muted)] bg-[var(--secondary)] truncate"
                />
                <Button onClick={handleCopyLink} size="sm" className="gap-1 whitespace-nowrap">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado" : "Copiar"}
                </Button>
              </div>

              <div className="mt-4 flex items-center gap-3 text-sm">
                <span className="text-[var(--muted)]">Slug:</span>
                <code className="text-xs bg-[var(--secondary)] px-2 py-1 rounded font-mono">{store.slug}</code>
                <a
                  href={storeUrl}
                  target="_blank"
                  className="ml-auto inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
                >
                  Abrir
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
