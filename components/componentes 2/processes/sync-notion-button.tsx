"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function SyncNotionButton({ processId }: { processId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/notion/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType: "process", entityId: processId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Falha ao sincronizar");
      toast.success("Sincronizado com o Notion");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={loading}>
      <RefreshCw className={loading ? "animate-spin" : ""} />
      {loading ? "Sincronizando..." : "Sincronizar com Notion"}
    </Button>
  );
}
