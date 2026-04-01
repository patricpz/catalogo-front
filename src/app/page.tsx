import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-16">
      <p className="text-xs font-medium uppercase tracking-widest text-[var(--accent)]">
        SaaS de catálogo
      </p>
      <h1 className="text-3xl font-semibold text-white sm:text-4xl">
        Organize produtos e finalize pedidos pelo WhatsApp.
      </h1>
      <p className="text-[var(--muted)]">
        Comece criando sua conta para acessar o painel. Autenticação com JWT, backend Express e
        PostgreSQL.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/register"
          className="rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          Criar conta
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-white hover:bg-white/5"
        >
          Já tenho conta
        </Link>
      </div>
    </div>
  );
}
