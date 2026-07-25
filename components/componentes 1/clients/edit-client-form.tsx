"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateClientRecord } from "@/lib/actions/clients";
import { ClientFormFields } from "@/components/clients/client-form-fields";
import { Button } from "@/components/ui/button";
import type { Client } from "@/types/database.types";

export function EditClientForm({ client }: { client: Client }) {
  const updateWithId = updateClientRecord.bind(null, client.id);
  const [state, formAction, pending] = useActionState(updateWithId, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <ClientFormFields client={client} />
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild type="button">
          <Link href={`/clients/${client.id}`}>Cancelar</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}
