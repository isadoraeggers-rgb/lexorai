"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateProcessRecord } from "@/lib/actions/processes";
import { ProcessFormFields } from "@/components/processes/process-form-fields";
import { Button } from "@/components/ui/button";
import type { Process } from "@/types/database.types";

export function EditProcessForm({
  process,
  team,
}: {
  process: Process;
  team: { id: string; full_name: string }[];
}) {
  const updateWithId = updateProcessRecord.bind(null, process.id);
  const [state, formAction, pending] = useActionState(updateWithId, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <ProcessFormFields process={process} team={team} clients={[]} />
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild type="button">
          <Link href={`/processes/${process.id}`}>Cancelar</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}
