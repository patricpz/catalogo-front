"use client";

import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useCart } from "@/contexts/cart-context";
import { clearAuthToken } from "@/lib/auth/storage";

import { User, Trash2, LogOut, Copy, Shield } from "lucide-react";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/useStore";

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const { clearCart } = useCart();
  const { success, info } = useToast();
  const router = useRouter();
  const storeQuery = useStore();

  const store = storeQuery.data ?? user?.store ?? null;
  const storeUrl = typeof window !== "undefined"
    ? `${window.location.origin}/catalog/${store?.slug || "minha-loja"}`
    : "";

  return (
    <div className="p-4 sm:p-8 lg:pl-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Configuracoes</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Gerencie sua conta e preferencias.</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Perfil */}
        <div className="rounded-xl border border-[var(--border)] bg-white shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <User className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <h3 className="font-semibold">Perfil</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Email</label>
              <div className="mt-1 h-10 rounded-lg border border-[var(--border)] px-3 flex items-center text-sm bg-[var(--secondary)]">
                {user?.email || "—"}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">ID do usuario</label>
              <div className="mt-1 h-10 rounded-lg border border-[var(--border)] px-3 flex items-center text-sm font-mono bg-[var(--secondary)]">
                {user?.id || "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Loja */}
        <div className="rounded-xl border border-[var(--border)] bg-white shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Copy className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold">Sua Loja</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">URL Publica</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={storeUrl}
                  className="flex-1 h-10 rounded-lg border border-[var(--border)] px-3 text-sm text-[var(--muted)] bg-[var(--secondary)]"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(storeUrl);
                    info("Link copiado!");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Slug</label>
              <div className="mt-1 h-10 rounded-lg border border-[var(--border)] px-3 flex items-center text-sm">
                {store?.slug || "minha-loja"}
              </div>
            </div>
          </div>
        </div>

        {/* Dados brutos */}
        <div className="rounded-xl border border-[var(--border)] bg-white shadow-sm p-6 space-y-4">
          <h3 className="font-semibold">Dados completos</h3>

          <div>
            <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">User (JSON)</label>
            <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--secondary)] p-3 text-xs leading-relaxed">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Store (JSON)</label>
            <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--secondary)] p-3 text-xs leading-relaxed">
              {storeQuery.isLoading ? "Carregando store..." : JSON.stringify(store, null, 2)}
            </pre>
          </div>
        </div>

        {/* Zona de perigo */}
        <div className="rounded-xl border border-red-200 bg-white shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-red-600">Zona de perigo</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Sair da conta</p>
                <p className="text-xs text-[var(--muted)]">Revogacao do token de acesso.</p>
              </div>
              <Button variant="ghost" size="sm" className="gap-1 text-red-500" onClick={() => {
                clearAuthToken();
                setUser(null);
                router.push("/login");
                success("Logout realizado com sucesso.");
              }}>
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>

            <div className="border-t border-[var(--border)]" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Limpar carrinho</p>
                <p className="text-xs text-[var(--muted)]">Remove todos os itens do carrinho local.</p>
              </div>
              <Button variant="ghost" size="sm" className="gap-1 text-red-500" onClick={() => {
                clearCart();
                success("Carrinho limpo.", "Todos os itens foram removidos.");
              }}>
                <Trash2 className="h-4 w-4" />
                Limpar
              </Button>
            </div>
          </div>
        </div>

        <p className="text-xs text-[var(--muted)] text-center pt-4">DevFlow v1.0.0 &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
