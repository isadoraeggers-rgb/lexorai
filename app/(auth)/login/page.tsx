"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const confirm = searchParams.get("confirm");
  const [state, formAction, pending] = useActionState(signIn, undefined);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
        <p className="text-sm text-muted-foreground">
          Acesse o seu escritório na Lexora.
        </p>
      </div>

      {confirm && (
        <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          Conta criada! Verifique seu e-mail para confirmar antes de entrar.
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirect" value={redirectTo} />
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="voce@escritorio.com" required autoFocus />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link href="/forgot-password" className="text-xs text-accent hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
        </div>

        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem uma conta?{" "}
        <Link href="/signup" className="font-medium text-accent hover:underline">
          Criar escritório
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
