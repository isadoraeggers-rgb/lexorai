"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatOab } from "@/lib/validation/oab";
import type { OabRegistration } from "@/types/database.types";

export function PublicationForm({
  monitoredOabs,
}: {
  monitoredOabs: (OabRegistration & { lawyerName?: string })[];
}) {
  const [oabId, setOabId] = useState(monitoredOabs[0]?.id ?? "");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ deadline_title: string; due_date: string | null; priority: string } | null>(
    null
  );
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !oabId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/monitoring/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oabRegistrationId: oabId, rawText: text }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Falha ao processar publicação");
      setResult(body.extracted);
      setText("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <p className="flex items-center gap-1.5 text-sm font-medium">
        <Sparkles className="size-4 text-accent" /> Colar publicação
      </p>
      <p className="text-sm text-muted-foreground">
        Cole o texto de uma publicação do Diário da Justiça. A IA identifica o processo, calcula o prazo e
        cria o registro automaticamente.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Select value={oabId} onValueChange={setOabId}>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue placeholder="Selecione a OAB monitorada" />
          </SelectTrigger>
          <SelectContent>
            {monitoredOabs.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {formatOab(r.oab_state, r.oab_number)} {r.lawyerName ? `— ${r.lawyerName}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Cole aqui o texto da publicação/intimação..."
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        {result && (
          <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
            Prazo criado: <strong>{result.deadline_title}</strong>
            {result.due_date && ` — vencimento ${result.due_date}`}
          </div>
        )}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading || !oabId}>
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {loading ? "Analisando..." : "Analisar e criar prazo"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
