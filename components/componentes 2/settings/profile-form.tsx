"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/actions/office";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/database.types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="full_name">Nome completo</Label>
        <Input id="full_name" name="full_name" defaultValue={profile.full_name} required />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">Cargo</Label>
          <Input id="title" name="title" defaultValue={profile.title ?? ""} placeholder="Sócio, Associado..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="oab_number">Número OAB</Label>
          <Input id="oab_number" name="oab_number" defaultValue={profile.oab_number ?? ""} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label>E-mail</Label>
        <Input value={profile.email} disabled />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-success">Perfil atualizado.</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar perfil"}
      </Button>
    </form>
  );
}
