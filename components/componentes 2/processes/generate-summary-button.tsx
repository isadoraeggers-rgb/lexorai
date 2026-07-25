"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function GenerateSummaryButton({ processId }: { processId: string }) {
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/agents/case-analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ processId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Falha ao gerar resumo");
      }
      toast.success("Resumo gerado pelo Analista de Casos");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} disabled={loading || pending}>
      <RefreshCw className={loading || pending ? "animate-spin" : ""} />
      {loading || pending ? "Gerando..." : "Gerar"}
    </Button>
  );
}
