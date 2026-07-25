"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function GenerateOfficeReport() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/agents/office-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodLabel: "mês atual" }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Falha ao gerar relatório");
      setResult(body.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <Sparkles className="size-4 text-accent" /> Relatório executivo (Gestor do Escritório)
        </p>
        <Button size="sm" onClick={handleRun} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {loading ? "Gerando..." : "Gerar relatório"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && <p className="whitespace-pre-wrap text-sm text-muted-foreground">{result}</p>}
    </Card>
  );
}
