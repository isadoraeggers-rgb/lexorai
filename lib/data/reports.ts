import { createClient } from "@/lib/supabase/server";

export async function getReportsData() {
  const supabase = await createClient();

  const [
    { data: processes },
    { data: tasks },
    { data: deadlines },
    { data: hearings },
    { data: team },
  ] = await Promise.all([
    supabase.from("processes").select("id, status, risk_level, priority, case_value, lawyer_id, created_at"),
    supabase.from("tasks").select("id, status, assigned_to"),
    supabase.from("deadlines").select("id, status"),
    supabase.from("hearings").select("id, status"),
    supabase.from("profiles").select("id, full_name").eq("is_active", true),
  ]);

  const nameById = new Map((team ?? []).map((t) => [t.id, t.full_name]));

  const casesByStatus = countBy(processes ?? [], "status");
  const casesByRisk = countBy(processes ?? [], "risk_level");
  const casesByPriority = countBy(processes ?? [], "priority");

  const deadlinesByStatus = countBy(deadlines ?? [], "status");
  const hearingsByStatus = countBy(hearings ?? [], "status");

  const productivity = (team ?? []).map((member) => ({
    name: member.full_name,
    processos: (processes ?? []).filter((p) => p.lawyer_id === member.id).length,
    tarefasConcluidas: (tasks ?? []).filter((t) => t.assigned_to === member.id && t.status === "done").length,
  }));

  const financialByStatus = Object.entries(
    (processes ?? []).reduce<Record<string, number>>((acc, p) => {
      if (p.case_value) acc[p.status] = (acc[p.status] ?? 0) + Number(p.case_value);
      return acc;
    }, {})
  ).map(([status, total]) => ({ status, total }));

  return {
    casesByStatus,
    casesByRisk,
    casesByPriority,
    deadlinesByStatus,
    hearingsByStatus,
    productivity,
    financialByStatus,
    raw: { processes: processes ?? [], tasks: tasks ?? [], deadlines: deadlines ?? [], hearings: hearings ?? [] },
    nameById,
  };
}

function countBy<T extends Record<string, unknown>>(items: T[], key: keyof T) {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const value = String(item[key]);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}
