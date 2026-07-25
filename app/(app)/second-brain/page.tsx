import { BrainCircuit } from "lucide-react";
import { listRecentMemories } from "@/lib/data/second-brain";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewMemoryDialog } from "@/components/second-brain/new-memory-dialog";
import { SemanticSearch } from "@/components/second-brain/semantic-search";
import { MEMORY_TYPE_LABEL } from "@/components/second-brain/memory-type";
import { formatDate } from "@/lib/utils";

export default async function SecondBrainPage() {
  const memories = await listRecentMemories();

  return (
    <div>
      <PageHeader
        title="Second Brain"
        description="A memória de longo prazo do escritório: decisões, estratégias, preferências de clientes e histórico processual, com busca semântica."
        actions={<NewMemoryDialog />}
      />

      <SemanticSearch />

      <h2 className="mb-3 text-sm font-medium text-muted-foreground">Memórias recentes</h2>
      {memories.length === 0 ? (
        <EmptyState
          icon={BrainCircuit}
          title="Nenhuma memória registrada"
          description="Cada decisão, estratégia e conversa relevante registrada aqui fica disponível para a IA lembrar depois."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((m) => (
            <Card key={m.id} className="gap-2 p-4">
              <Badge variant="accent">{MEMORY_TYPE_LABEL[m.type]}</Badge>
              <p className="font-medium">{m.title}</p>
              <p className="line-clamp-3 text-sm text-muted-foreground">{m.content}</p>
              <p className="text-xs text-muted-foreground">{formatDate(m.created_at)}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
