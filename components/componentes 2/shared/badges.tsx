import { Badge } from "@/components/ui/badge";
import type {
  PriorityLevel,
  RiskLevel,
  ProcessStatus,
  DeadlineStatus,
  TaskStatus,
  HearingStatus,
} from "@/types/database.types";

const PRIORITY_LABEL: Record<PriorityLevel, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

const PRIORITY_VARIANT: Record<PriorityLevel, "secondary" | "accent" | "warning" | "destructive"> = {
  low: "secondary",
  medium: "accent",
  high: "warning",
  urgent: "destructive",
};

export function PriorityBadge({ priority }: { priority: PriorityLevel }) {
  return <Badge variant={PRIORITY_VARIANT[priority]}>{PRIORITY_LABEL[priority]}</Badge>;
}

const RISK_LABEL: Record<RiskLevel, string> = {
  low: "Baixo",
  medium: "Médio",
  high: "Alto",
  critical: "Crítico",
};

const RISK_VARIANT: Record<RiskLevel, "secondary" | "accent" | "warning" | "destructive"> = {
  low: "secondary",
  medium: "accent",
  high: "warning",
  critical: "destructive",
};

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return <Badge variant={RISK_VARIANT[risk]}>Risco {RISK_LABEL[risk]}</Badge>;
}

const PROCESS_STATUS_LABEL: Record<ProcessStatus, string> = {
  active: "Ativo",
  suspended: "Suspenso",
  archived: "Arquivado",
  won: "Ganho",
  lost: "Perdido",
  settled: "Acordo",
};

const PROCESS_STATUS_VARIANT: Record<ProcessStatus, "secondary" | "accent" | "success" | "destructive" | "outline"> = {
  active: "accent",
  suspended: "outline",
  archived: "secondary",
  won: "success",
  lost: "destructive",
  settled: "success",
};

export function ProcessStatusBadge({ status }: { status: ProcessStatus }) {
  return <Badge variant={PROCESS_STATUS_VARIANT[status]}>{PROCESS_STATUS_LABEL[status]}</Badge>;
}

const DEADLINE_STATUS_LABEL: Record<DeadlineStatus, string> = {
  upcoming: "Em dia",
  completed: "Concluído",
  late: "Atrasado",
};

const DEADLINE_STATUS_VARIANT: Record<DeadlineStatus, "accent" | "success" | "destructive"> = {
  upcoming: "accent",
  completed: "success",
  late: "destructive",
};

export function DeadlineStatusBadge({ status }: { status: DeadlineStatus }) {
  return <Badge variant={DEADLINE_STATUS_VARIANT[status]}>{DEADLINE_STATUS_LABEL[status]}</Badge>;
}

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "A Fazer",
  doing: "Em Andamento",
  waiting: "Aguardando",
  done: "Concluído",
};

const HEARING_STATUS_LABEL: Record<HearingStatus, string> = {
  scheduled: "Agendada",
  completed: "Realizada",
  cancelled: "Cancelada",
  rescheduled: "Remarcada",
};

const HEARING_STATUS_VARIANT: Record<HearingStatus, "accent" | "success" | "destructive" | "outline"> = {
  scheduled: "accent",
  completed: "success",
  cancelled: "destructive",
  rescheduled: "outline",
};

export function HearingStatusBadge({ status }: { status: HearingStatus }) {
  return <Badge variant={HEARING_STATUS_VARIANT[status]}>{HEARING_STATUS_LABEL[status]}</Badge>;
}
