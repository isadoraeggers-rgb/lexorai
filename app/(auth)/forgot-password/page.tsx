"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings/security`,
    });
    setPending(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Redefinir senha</h1>
        <p className="text-sm text-muted-foreground">
          Enviaremos um link para redefinir sua senha.
        </p>
      </div>

      {sent ? (
        <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          Se existir uma conta com esse e-mail, um link foi enviado.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Enviando..." : "Enviar link"}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-accent hover:underline">
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
