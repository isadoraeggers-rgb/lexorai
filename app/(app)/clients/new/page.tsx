"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft } from "lucide-react";
import { createClientRecord } from "@/lib/actions/clients";
import { ClientFormFields } from "@/components/clients/client-form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NewClientPage() {
  const [state, formAction, pending] = useActionState(createClientRecord, undefined);

  return (
    <div>
      <PageHeader
        title="Novo cliente"
        description="Cadastre um novo cliente do escritório."
        actions={
          <Button variant="outline" asChild>
            <Link href="/clients">
              <ArrowLeft /> Voltar
            </Link>
          </Button>
        }
      />

      <Card className="max-w-3xl">
        <form action={formAction} className="space-y-6">
          <ClientFormFields />
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild type="button">
              <Link href="/clients">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar cliente"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
