import Link from "next/link";
import {
  CalendarClock,
  Gavel,
  KanbanSquare,
  Scale,
  Sparkles,
  Users,
  ArrowUpRight,
  FileWarning,
  Clock,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/data/profile";
import { getDashboardData } from "@/lib/data/dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { TasksChart } from "@/components/dashboard/tasks-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriorityBadge, ProcessStatusBadge } from "@/components/shared/badges";
import { formatDateTime, formatRelative } from "@/lib/utils";

const AGENT_LABEL: Record<string, string> = {
  assistant: "Assistente",
  controladoria: "Controladoria Jurídica",
  petition_writer: "Redator de Petições",
  case_analyst: "Analista de Casos",
  document_reviewer: "Revisor de Documentos",
  office_manager: "Gestor do Escritório",
};

export default async function DashboardPage() {
  const session = await getCurrentProfile();
  const profile = session!.profile;
  const data = await getDashboardData(profile.id);

  const firstName = profile.full_name.split(" ")[0];

  return (
    <div>
      <PageHeader
        title={`Olá, ${firstName}`}
        description="Aqui está o que precisa da sua atenção hoje."
        actions={
          <Button asChild>
            <Link href="/ai">
              <Sparkles /> Perguntar à IA
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Processos sem movimentação"
          value={data.snapshot?.processes_without_movement ?? 0}
          icon={FileWarning}
          tone="warning"
        />
        <StatCard
          label="Prazos atrasados"
          value={data.snapshot?.late_deadlines ?? 0}
          icon={CalendarClock}
          tone="destructive"
        />
        <StatCard
          label="Audiências esta semana"
          value={data.snapshot?.hearings_this_week ?? 0}
          icon={Gavel}
        />
        <StatCard
          label="Clientes ativos"
          value={data.snapshot?.active_clients ?? 0}
          icon={Users}
          tone="success"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Prazos de hoje</CardTitle>
            <Link href="/deadlines" className="text-xs text-accent hover:underline">
              Ver todos
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {data.todayDeadlines.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="Nenhum prazo para hoje"
                description="Você está em dia com seus prazos."
                className="border-none py-10"
              />
            ) : (
              <div className="flex flex-col">
                {data.todayDeadlines.map((d) => (
                  <Link
                    key={d.id}
                    href={d.process_id ? `/processes/${d.process_id}` : "/deadlines"}
                    className="flex items-center justify-between gap-3 border-t border-border px-1 py-3 first:border-none hover:bg-secondary/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.processNumber ? `Processo ${d.processNumber} · ` : ""}
                        {formatDateTime(d.due_date)}
                      </p>
                    </div>
                    <PriorityBadge priority={d.priority} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Audiências próximas</CardTitle>
            <Link href="/hearings" className="text-xs text-accent hover:underline">
              Ver todas
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {data.upcomingHearings.length === 0 ? (
              <EmptyState
                icon={Gavel}
                title="Nenhuma audiência"
                description="Sem audiências nos próximos 7 dias."
                className="border-none py-10"
              />
            ) : (
              <div className="flex flex-col">
                {data.upcomingHearings.map((h) => (
                  <Link
                    key={h.id}
                    href={h.process_id ? `/processes/${h.process_id}` : "/hearings"}
                    className="flex items-center justify-between gap-3 border-t border-border px-1 py-3 first:border-none hover:bg-secondary/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{h.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(h.scheduled_at)}</p>
                    </div>
                    <Badge variant="outline">{h.location_type === "online" ? "Online" : "Presencial"}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Minhas tarefas</CardTitle>
            <Link href="/tasks" className="text-xs text-accent hover:underline">
              Ver quadro
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {data.pendingTasks.length === 0 ? (
              <EmptyState
                icon={KanbanSquare}
                title="Tudo limpo"
                description="Nenhuma tarefa pendente atribuída a você."
                className="border-none py-10"
              />
            ) : (
              <div className="flex flex-col">
                {data.pendingTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 border-t border-border px-1 py-3 first:border-none">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <PriorityBadge priority={t.priority} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Processos recentes</CardTitle>
            <Link href="/processes" className="text-xs text-accent hover:underline">
              Ver todos
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentProcesses.length === 0 ? (
              <EmptyState
                icon={Scale}
                title="Nenhum processo"
                description="Cadastre seu primeiro processo."
                className="border-none py-10"
              />
            ) : (
              <div className="flex flex-col">
                {data.recentProcesses.map((p) => (
                  <Link
                    key={p.id}
                    href={`/processes/${p.id}`}
                    className="flex items-center justify-between gap-3 border-t border-border px-1 py-3 first:border-none hover:bg-secondary/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.number}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.subject ?? "Sem assunto"}</p>
                    </div>
                    <ProcessStatusBadge status={p.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Atividade recente da IA</CardTitle>
            <Link href="/ai" className="text-xs text-accent hover:underline">
              Abrir assistente
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentAiRuns.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="Sem atividade ainda"
                description="Os agentes de IA aparecerão aqui."
                className="border-none py-10"
              />
            ) : (
              <div className="flex flex-col">
                {data.recentAiRuns.map((run) => (
                  <div key={run.id} className="flex items-start gap-2 border-t border-border px-1 py-3 first:border-none">
                    <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-accent">{AGENT_LABEL[run.agent_type]}</p>
                      <p className="truncate text-sm">{run.summary}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" /> {formatRelative(run.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Tarefas por status</CardTitle>
          <Link href="/reports" className="flex items-center gap-1 text-xs text-accent hover:underline">
            Relatórios completos <ArrowUpRight className="size-3" />
          </Link>
        </CardHeader>
        <CardContent>
          <TasksChart data={data.tasksByStatus} />
        </CardContent>
      </Card>
    </div>
  );
}
