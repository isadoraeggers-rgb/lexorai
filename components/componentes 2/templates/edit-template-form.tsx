"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateTemplate } from "@/lib/actions/templates";
import { TemplateFormFields } from "@/components/templates/template-form-fields";
import { Button } from "@/components/ui/button";
import type { Template } from "@/types/database.types";

export function EditTemplateForm({ template }: { template: Template }) {
  const updateWithId = updateTemplate.bind(null, template.id);
  const [state, formAction, pending] = useActionState(updateWithId, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <TemplateFormFields template={template} />
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild type="button">
          <Link href="/templates">Cancelar</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}
