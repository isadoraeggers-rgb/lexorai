"use client";

import { useActionState } from "react";
import { updateOffice } from "@/lib/actions/office";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Organization } from "@/types/database.types";

export function OfficeForm({ organization, canEdit }: { organization: Organization; canEdit: boolean }) {
  const [state, formAction, pending] = useActionState(updateOffice, undefined);
  const address = organization.address as Record<string, string>;

  return (
    <form action={formAction} className="space-y-4">
      <fieldset disabled={!canEdit} className="space-y-4 disabled:opacity-60">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome do escritório</Label>
            <Input id="name" name="name" defaultValue={organization.name} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="oab_registration">Registro OAB</Label>
            <Input id="oab_registration" name="oab_registration" defaultValue={organization.oab_registration ?? ""} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="brand_color">Cor da marca</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="brand_color"
              name="brand_color"
              defaultValue={organization.brand_color}
              className="h-9 w-14 cursor-pointer rounded-lg border border-input bg-card"
            />
            <span className="text-sm text-muted-foreground">{organization.brand_color}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="street">Endereço</Label>
            <Input id="street" name="street" defaultValue={address.street ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" name="city" defaultValue={address.city ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state">Estado</Label>
            <Input id="state" name="state" defaultValue={address.state ?? ""} />
          </div>
        </div>
      </fieldset>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-success">Salvo com sucesso.</p>}
      {canEdit && (
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar alterações"}
        </Button>
      )}
    </form>
  );
}
