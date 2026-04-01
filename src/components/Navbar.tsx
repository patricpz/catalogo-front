"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuthToken, getAuthToken } from "@/lib/auth/storage";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(getAuthToken()));
  }, [pathname]);

  function handleLogout() {
    clearAuthToken();
    setHasToken(false);
    router.push("/login");
    router.refresh();
  }

  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight text-white">
          Catálogo SaaS
        </Link>
        <nav className="flex items-center gap-4 text-sm text-[var(--muted)]">
          {!isAuthPage && hasToken && (
            <Link href="/dashboard" className="hover:text-white">
              Dashboard
            </Link>
          )}
          {!hasToken ? (
            <>
              <Link href="/login" className="hover:text-white">
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-[var(--accent)] px-3 py-1.5 font-medium text-white hover:bg-[var(--accent-hover)]"
              >
                Criar conta
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-white hover:bg-white/5"
            >
              Sair
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
