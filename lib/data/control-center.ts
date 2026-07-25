import { createClient } from "@/lib/supabase/server";

export async function getControlCenterData() {
  const supabase = await createClient();
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: snapshot },
    { data: lateDeadlines },
    { data: staleProcesses },
    { data: hearingsThisWeek },
    { data: overdueTasks },
    { data: allProcesses },
    { data: allTasks },
    { data: team },
    { data: recentRuns },
  ] = await Promise.all([
    supabase.from("control_center_snapshot").select("*").maybeSingle(),
    supabase
      .from("deadlines")
      .select("id, title, due_date, process_id")
      .eq("status", "late")
      .order("due_date", { ascending: true })
      .limit(10),
    supabase
      .from("processes")
      .select("id, number, last_movement_at")
      .eq("status", "active")
      .order("last_movement_at", { ascending: true, nullsFirst: true })
      .limit(10),
    supabase
      .from("hearings")
      .select("id, title, scheduled_at")
      .eq("status", "scheduled")
      .gte("scheduled_at", now.toISOString())
      .lte("scheduled_at", in7Days)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("tasks")
      .select("id, title, due_date, assigned_to")
      .neq("status", "done")
      .lt("due_date", now.toISOString())
      .order("due_date", { ascending: true })
      .limit(10),
    supabase.from("processes").select("lawyer_id, status"),
    supabase.from("tasks").select("assigned_to, status"),
    supabase.from("profiles").select("id, full_name, avatar_url").eq("is_active", true),
    supabase
      .from("ai_agent_runs")
      .select("id, summary, created_at")
      .eq("agent_type", "controladoria")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const productivity = (team ?? []).map((member) => {
    const activeProcesses = (allProcesses ?? []).filter(
      (p) => p.lawyer_id === member.id && p.status === "active"
    ).length;
    const doneTasks = (allTasks ?? []).filter(
      (t) => t.assigned_to === member.id && t.status === "done"
    ).length;
    const pendingTasks = (allTasks ?? []).filter(
      (t) => t.assigned_to === member.id && t.status !== "done"
    ).length;
    return { ...member, activeProcesses, doneTasks, pendingTasks };
  });

  return {
    snapshot,
    lateDeadlines: lateDeadlines ?? [],
    staleProcesses: staleProcesses ?? [],
    hearingsThisWeek: hearingsThisWeek ?? [],
    overdueTasks: overdueTasks ?? [],
    productivity,
    recentRuns: recentRuns ?? [],
  };
}
