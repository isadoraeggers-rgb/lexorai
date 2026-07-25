"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, undefined);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Criar seu escritório</h1>
        <p className="text-sm text-muted-foreground">
          Comece a usar a Lexora em menos de um minuto.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="organization_name">Nome do escritório</Label>
          <Input id="organization_name" name="organization_name" placeholder="Silva & Associados" required autoFocus />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Seu nome completo</Label>
          <Input id="full_name" name="full_name" placeholder="Maria Silva" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="voce@escritorio.com" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="mínimo 8 caracteres" minLength={8} required />
        </div>

        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Criando..." : "Criar escritório"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
