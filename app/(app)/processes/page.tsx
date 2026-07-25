import Link from "next/link";
import { Plus, Scale, Search } from "lucide-react";
import { listProcesses } from "@/lib/data/processes";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProcessStatusBadge, PriorityBadge, RiskBadge } from "@/components/shared/badges";
import { formatDate } from "@/lib/utils";
import type { ProcessStatus } from "@/types/database.types";

export default async function ProcessesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: ProcessStatus }>;
}) {
  const { q, status } = await searchParams;
  const processes = await listProcesses({ search: q, status });

  return (
    <div>
      <PageHeader
        title="Processos"
        description={`${processes.length} processo${processes.length === 1 ? "" : "s"}`}
        actions={
          <Button asChild>
            <Link href="/processes/new">
              <Plus /> Novo processo
            </Link>
          </Button>
        }
      />

      <form className="mb-4 max-w-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Buscar por número, assunto..." className="pl-9" />
        </div>
      </form>

      {processes.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="Nenhum processo encontrado"
          description="Cadastre seu primeiro processo para começar a acompanhar prazos e audiências."
          action={
            <Button asChild>
              <Link href="/processes/new">
                <Plus /> Novo processo
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Processo</TableHead>
                <TableHead>Parte contrária</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Risco</TableHead>
                <TableHead>Atualizado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processes.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link href={`/processes/${p.id}`}>
                      <p className="font-medium">{p.number}</p>
                      <p className="text-xs text-muted-foreground">{p.subject ?? p.court ?? "—"}</p>
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.opposing_party ?? "—"}</TableCell>
                  <TableCell>
                    <ProcessStatusBadge status={p.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={p.priority} />
                  </TableCell>
                  <TableCell>
                    <RiskBadge risk={p.risk_level} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(p.updated_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
