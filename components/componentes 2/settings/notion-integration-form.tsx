"use client";

import { useActionState, useState } from "react";
import { RefreshCw } from "lucide-react";
import { saveNotionDatabaseMap } from "@/lib/actions/notion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { NotionEntityType } from "@/types/database.types";

const FIELDS: { key: NotionEntityType; name: string; label: string }[] = [
  { key: "process", name: "process_db", label: "Banco de dados: Processos" },
  { key: "client", name: "client_db", label: "Banco de dados: Clientes" },
  { key: "hearing", name: "hearing_db", label: "Banco de dados: Audiências" },
  { key: "deadline", name: "deadline_db", label: "Banco de dados: Prazos" },
  { key: "task", name: "task_db", label: "Banco de dados: Tarefas" },
  { key: "wiki_page", name: "wiki_db", label: "Banco de dados: Wiki / Conhecimento" },
];

export function NotionIntegrationForm({
  databaseMap,
}: {
  databaseMap: Partial<Record<NotionEntityType, string>>;
}) {
  const [state, formAction, pending] = useActionState(saveNotionDatabaseMap, undefined);
  const [pulling, setPulling] = useState(false);
  const [pullResult, setPullResult] = useState<string | null>(null);

  async function handlePull() {
    setPulling(true);
    setPullResult(null);
    try {
      const res = await fetch("/api/notion/pull", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Falha ao importar");
      setPullResult(`${body.imported} páginas importadas para o Second Brain.`);
    } catch (err) {
      setPullResult(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setPulling(false);
    }
  }

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        {FIELDS.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              name={field.name}
              defaultValue={databaseMap[field.key] ?? ""}
              placeholder="ID do banco de dados no Notion"
            />
          </div>
        ))}
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state?.success && <p className="text-sm text-success">Configuração salva.</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar configuração"}
        </Button>
      </form>

      <div className="border-t border-border pt-4">
        <p className="mb-2 text-sm font-medium">Base de conhecimento</p>
        <p className="mb-3 text-sm text-muted-foreground">
          Importa procedimentos, jurisprudência, doutrina e políticas do Notion para o Second Brain —
          a IA passa a consultar esse conteúdo antes de responder.
        </p>
        <Button variant="outline" onClick={handlePull} disabled={pulling}>
          <RefreshCw className={pulling ? "animate-spin" : ""} />
          {pulling ? "Importando..." : "Importar Wiki do Notion"}
        </Button>
        {pullResult && <p className="mt-2 text-sm text-muted-foreground">{pullResult}</p>}
      </div>
    </div>
  );
}
