"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";
import { setAuthToken } from "@/lib/auth/storage";
import { Eye, EyeOff, ArrowRight, Wallet } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => login(email, password),
    onSuccess: (data) => {
      setAuthToken(data.accessToken);
      router.push("/dashboard");
      router.refresh();
    },
    onError: (err: unknown) => {
      setError(getApiErrorMessage(err));
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Informe o e-mail.");
      return;
    }
    if (!password) {
      setError("Informe a senha.");
      return;
    }

    loginMutation.mutate({ email: email.trim(), password });
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      
      {/* EFEITO DE ANÉIS NO FUNDO */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
        <div className="absolute w-[600px] h-[600px] rounded-full border border-slate-200/40"></div>
        <div className="absolute w-[900px] h-[900px] rounded-full border border-slate-200/40"></div>
        <div className="absolute w-[1200px] h-[1200px] rounded-full border border-slate-200/40"></div>
        <div className="absolute w-[1500px] h-[1500px] rounded-full border border-slate-200/40"></div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 z-10">
        
        {/* Cabeçalho / Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 shadow-md">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2">
            SaaS Catalog
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Acesse sua conta para ir ao dashboard
          </p>
        </div>

        {/* Card de Login */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 border border-slate-100">
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Mensagem de Erro */}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-100">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            {/* Input E-mail */}
            <div>
              <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@empresa.com"
                className="w-full rounded-lg bg-[#eef2f9] px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:bg-[#e4ebf5] focus:ring-2 focus:ring-green-500/50"
              />
            </div>

            {/* Input Senha */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Senha
                </label>
                <Link href="/esqueci-a-senha" className="text-[11px] font-bold text-green-700 hover:text-green-800">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-[#eef2f9] px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:bg-[#e4ebf5] focus:ring-2 focus:ring-green-500/50 tracking-widest font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Botão de Submit */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-700 to-green-500 py-3 text-sm font-semibold text-white shadow-md shadow-green-600/20 transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? 'Entrando...' : 'Entrar no Dashboard'}
              {!loginMutation.isPending && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {/* Divisor */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-slate-100"></div>
            <span className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Ou
            </span>
            <div className="flex-1 border-t border-slate-100"></div>
          </div>

          {/* Botão Google */}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#eef2f9] py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-[#e4ebf5]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar com Google
          </button>
        </div>

        {/* Link de Cadastro */}
        <div className="mt-8 text-sm text-slate-500">
          Não tem uma conta?{' '}
          <Link href="/register" className="font-bold text-green-700 hover:underline">
            Cadastre-se
          </Link>
        </div>
      </main>

      {/* RODAPÉ */}
      <footer className="w-full px-6 py-8 z-10 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <div>
          © {new Date().getFullYear()} SAAS CATALOG. TODOS OS DIREITOS RESERVADOS.
        </div>
        <div className="flex items-center gap-6">
          <Link href="/privacidade" className="hover:text-slate-600 transition-colors">Política de Privacidade</Link>
          <Link href="/termos" className="hover:text-slate-600 transition-colors">Termos de Serviço</Link>
          <Link href="/suporte" className="hover:text-slate-600 transition-colors">Suporte</Link>
        </div>
      </footer>

    </div>
  );
}