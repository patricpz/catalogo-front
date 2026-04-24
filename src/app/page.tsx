import Link from "next/link";
import { ShoppingBag, Rocket, Share2, MessageCircle, BarChart3, Shield } from "lucide-react";

const features = [
  {
    icon: <Rocket className="h-6 w-6" />,
    title: "Configure em 5 minutos",
    desc: "Sem codigo. Cadastre seus produtos e compartilhe o link da sua loja.",
  },
  {
    icon: <Share2 className="h-6 w-6" />,
    title: "Link unico da loja",
    desc: "Cada vendedor tem uma pagina publica com seus produtos.",
  },
  {
    icon: <MessageCircle className="h-6 w-6" />,
    title: "Pedidos via WhatsApp",
    desc: "Cliente monta o carrinho e o pedido e enviado formatado no seu WhatsApp.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Dashboard completo",
    desc: "Acompanhe vendas, produtos e pedidos em um painel intuitivo.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Seguro e confiavel",
    desc: "Autenticacao JWT, dados protegidos e uptime garantido.",
  },
  {
    icon: <ShoppingBag className="h-6 w-6" />,
    title: "Carrinho integrado",
    desc: "Experiencia de compra fluida com carrinho salvo no navegador.",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-50 w-full border-b border-[var(--border)]/40 bg-[var(--background)]/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-emerald-600">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">DevFlow</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] hidden sm:block">
              Entrar
            </Link>
            <Link href="/register" className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-medium text-white shadow-sm transition-all hover:bg-[var(--accent-hover)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2">
              Crie sua loja gratis
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-4 pt-24 pb-20 sm:pt-32 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
              Sua loja online,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-emerald-500">
                pronta em minutos
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-[var(--muted)] max-w-2xl mx-auto">
              Crie um catalogo profissional, compartilhe o link e receba pedidos direto no WhatsApp. Sem mensalidade, sem complicacao.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-8 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-[var(--accent-hover)] hover:shadow-xl hover:scale-105">
                Comecar agora
              </Link>
              <Link href="/catalog/demo" className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--border)] px-8 text-base font-semibold text-[var(--foreground)] transition-all hover:bg-[var(--secondary)]">
                Ver demonstracao
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-[var(--secondary)]/50 py-20 sm:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold sm:text-4xl">
              Tudo que voce precisa
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-[var(--muted)]">
              Da criacao ao pedido, tudo em um so lugar.
            </p>

            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[var(--accent)]">
                    {f.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 sm:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold sm:text-4xl">
              Planos simples e transparentes
            </h2>

            <div className="mt-14 mx-auto max-w-md">
              <div className="rounded-2xl border-2 border-[var(--accent)] bg-[var(--card)] p-8 shadow-lg relative overflow-hidden">
                <div className="absolute top-4 right-4 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white">
                  Gratis
                </div>
                <h3 className="text-2xl font-bold">Plano Starter</h3>
                <p className="mt-2 text-[var(--muted)]">Tudo para comecar a vender hoje.</p>
                <div className="mt-6">
                  <span className="text-5xl font-extrabold">R$ 0</span>
                  <span className="text-[var(--muted)]">/mes</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  {["Produtos ilimitados", "Pagina publica personalizada", "Carrinho de compras", "Pedidos via WhatsApp", "Dashboard completo"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="mt-8 flex w-full items-center justify-center rounded-full bg-[var(--accent)] py-3 text-base font-semibold text-white transition-all hover:bg-[var(--accent-hover)]">
                  Criar minha loja
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-28 bg-gradient-to-b from-[var(--background)] to-emerald-50/50">
          <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold sm:text-4xl">Pronto para lancar sua loja?</h2>
            <p className="mt-4 text-[var(--muted)] max-w-lg mx-auto">
              Cadastre-se gratuitamente e tenha seu catalogo online em minutos.
            </p>
            <div className="mt-8">
              <Link href="/register" className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-8 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-[var(--accent-hover)] hover:shadow-xl">
                Criar conta gratuita
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] py-10">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 sm:px-6 lg:px-8 text-sm text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-emerald-600">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">DevFlow</span>
          </div>
          <p>&copy; {new Date().getFullYear()} DevFlow. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
