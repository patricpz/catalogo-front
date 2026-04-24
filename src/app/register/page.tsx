"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { register } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";
import { setAuthToken } from "@/lib/auth/storage";
import { Card, Input, Button, Alert } from '@/components/ui'
import PageShell from '@/components/ui/PageShell'

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const registerMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => register(email, password),
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
    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    registerMutation.mutate({ email: email.trim(), password });
  }

  return (
    <PageShell className="items-center">
      <Card className="max-w-md w-full">
        <h1 className="text-2xl font-semibold text-foreground">Criar conta</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Use um e-mail válido e uma senha segura.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            label="E-mail"
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Senha"
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mt-1 text-xs text-[var(--muted)]">Mínimo 8 caracteres.</p>

          <Input
            label="Confirmar senha"
            id="confirm"
            name="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          {error && <Alert className="text-sm" variant="destructive">{error}</Alert>}

          <Button type="submit" className="mt-2" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? 'Criando…' : 'Cadastrar'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          Já tem conta?{' '}
          <Link href="/login" className="text-[var(--accent)] hover:underline">
            Entrar
          </Link>
        </p>
      </Card>
    </PageShell>
  );
}
