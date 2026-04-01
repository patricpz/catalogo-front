"use client";

import { useEffect, useState } from "react";
import { fetchMe } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";
import type { User } from "@/lib/api/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { user: u } = await fetchMe();
        if (!cancelled) setUser(u);
      } catch (e) {
        if (!cancelled) setError(getApiErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-[var(--muted)]">Carregando…</div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-[var(--error)]">{error ?? "Não foi possível carregar o perfil."}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
      <p className="mt-4 text-lg text-[var(--foreground)]">
        Bem-vindo, <span className="font-medium text-white">{user.email}</span>
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Conta criada em {new Date(user.createdAt).toLocaleString("pt-BR")}
      </p>
      <div className="mt-10 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <p className="text-sm text-[var(--muted)]">
          Próximos passos: cadastro de loja, catálogo e integração com WhatsApp.
        </p>
      </div>
    </div>
  );
}
