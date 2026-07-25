import Link from "next/link";
import {
  FileWarning,
  CalendarClock,
  Gavel,
  KanbanSquare,
  ScanText,
  Users,
} from "lucide-react";
import { getControlCenterData } from "@/lib/data/control-center";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RunControladoria } from "@/components/control-center/run-controladoria";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatDateTime, initials } from "@/lib/utils";

export default async function ControlCenterPage() {
  const {
    snapshot,
    lateDeadlines,
    staleProcesses,
    hearingsThisWeek,
    overdueTasks,
    productivity,
  } = await getControlCenterData();

  const maxProcesses = Math.max(1, ...productivity.map((p) => p.activeProcesses));

  return (
    <div>
      <PageHeader
        title="Control Center"
        description="Visão consolidada da operação jurídica do escritório."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="Processos sem movimentação"
          value={snapshot?.processes_without_movement ?? 0}
          icon={FileWarning}
          tone="warning"
        />
        <StatCard
          label="Prazos atrasados"
          value={snapshot?.late_deadlines ?? 0}
          icon={CalendarClock}
          tone="destructive"
        />
        <StatCard label="Audiências esta semana" value={snapshot?.hearings_this_week ?? 0} icon={Gavel} />
        <StatCard
          label="Tarefas atrasadas"
          value={snapshot?.tasks_overdue ?? 0}
          icon={KanbanSquare}
          tone="destructive"
        />
        <StatCard
          label="Documentos sem OCR"
          value={snapshot?.documents_missing_ocr ?? 0}
          icon={ScanText}
          tone="warning"
        />
        <StatCard label="Clientes ativos" value={snapshot?.active_clients ?? 0} icon={Users} tone="success" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RunControladoria />

        <Card>
          <CardHeader>
            <CardTitle>Produtividade por advogado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {productivity.length === 0 ? (
              <EmptyState icon={Users} title="Nenhum advogado cadastrado" className="border-none py-8" />
            ) : (
              productivity.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback>{initials(p.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{p.full_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {p.activeProcesses} processos · {p.doneTasks} tarefas concluídas
                      </span>
                    </div>
                    <Progress value={(p.activeProcesses / maxProcesses) * 100} className="mt-1" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prazos atrasados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {lateDeadlines.length === 0 ? (
              <EmptyState icon={CalendarClock} title="Nenhum prazo atrasado" className="border-none py-8" />
            ) : (
              lateDeadlines.map((d) => (
                <Link
                  key={d.id}
                  href="/deadlines"
                  className="flex items-center justify-between border-t border-border px-1 py-2.5 text-sm first:border-none hover:bg-secondary/50"
                >
                  <span>{d.title}</span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(d.due_date)}</span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processos parados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {staleProcesses.length === 0 ? (
              <EmptyState icon={FileWarning} title="Nenhum processo parado" className="border-none py-8" />
            ) : (
              staleProcesses.map((p) => (
                <Link
                  key={p.id}
                  href={`/processes/${p.id}`}
                  className="flex items-center justify-between border-t border-border px-1 py-2.5 text-sm first:border-none hover:bg-secondary/50"
                >
                  <span>{p.number}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.last_movement_at ? formatDate(p.last_movement_at) : "Sem movimentação"}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audiências desta semana</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {hearingsThisWeek.length === 0 ? (
              <EmptyState icon={Gavel} title="Nenhuma audiência" className="border-none py-8" />
            ) : (
              hearingsThisWeek.map((h) => (
                <Link
                  key={h.id}
                  href={`/hearings/${h.id}`}
                  className="flex items-center justify-between border-t border-border px-1 py-2.5 text-sm first:border-none hover:bg-secondary/50"
                >
                  <span>{h.title}</span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(h.scheduled_at)}</span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tarefas atrasadas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {overdueTasks.length === 0 ? (
              <EmptyState icon={KanbanSquare} title="Nenhuma tarefa atrasada" className="border-none py-8" />
            ) : (
              overdueTasks.map((t) => (
                <Link
                  key={t.id}
                  href="/tasks"
                  className="flex items-center justify-between border-t border-border px-1 py-2.5 text-sm first:border-none hover:bg-secondary/50"
                >
                  <span>{t.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {t.due_date ? formatDate(t.due_date) : ""}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
