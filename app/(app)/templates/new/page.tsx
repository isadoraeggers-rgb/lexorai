"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft } from "lucide-react";
import { createTemplate } from "@/lib/actions/templates";
import { TemplateFormFields } from "@/components/templates/template-form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NewTemplatePage() {
  const [state, formAction, pending] = useActionState(createTemplate, undefined);

  return (
    <div>
      <PageHeader
        title="Novo modelo"
        actions={
          <Button variant="outline" asChild>
            <Link href="/templates">
              <ArrowLeft /> Voltar
            </Link>
          </Button>
        }
      />
      <Card className="max-w-3xl">
        <form action={formAction} className="space-y-6">
          <TemplateFormFields />
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild type="button">
              <Link href="/templates">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar modelo"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
