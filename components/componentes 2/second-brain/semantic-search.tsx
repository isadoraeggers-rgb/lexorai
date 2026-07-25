"use client";

import { useState } from "react";
import { BrainCircuit, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { MEMORY_TYPE_LABEL } from "@/components/second-brain/memory-type";
import { formatDate } from "@/lib/utils";
import type { MemoryType } from "@/types/database.types";

type Result = {
  id: string;
  type: MemoryType;
  title: string;
  content: string;
  similarity: number;
  created_at: string;
};

export function SemanticSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/second-brain/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Erro na busca");
      setResults(body.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pergunte algo: 'qual a estratégia usada no caso X?'"
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <BrainCircuit />}
          Buscar
        </Button>
      </form>

      {error && (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {results && (
        <div className="mb-6">
          {results.length === 0 ? (
            <EmptyState icon={BrainCircuit} title="Nenhuma memória relevante encontrada" />
          ) : (
            <div className="flex flex-col gap-2">
              {results.map((r) => (
                <Card key={r.id} className="gap-2 p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="accent">{MEMORY_TYPE_LABEL[r.type]}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(r.similarity * 100)}% relevante
                    </span>
                  </div>
                  <p className="font-medium">{r.title}</p>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{r.content}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
