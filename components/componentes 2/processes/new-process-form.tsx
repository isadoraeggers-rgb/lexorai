"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createProcessRecord } from "@/lib/actions/processes";
import { ProcessFormFields } from "@/components/processes/process-form-fields";
import { Button } from "@/components/ui/button";

export function NewProcessForm({
  team,
  clients,
}: {
  team: { id: string; full_name: string }[];
  clients: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createProcessRecord, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <ProcessFormFields team={team} clients={clients} />
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild type="button">
          <Link href="/processes">Cancelar</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar processo"}
        </Button>
      </div>
    </form>
  );
}
