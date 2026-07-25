import { createClient } from "@/lib/supabase/server";

export async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: todayDeadlines },
    { data: upcomingHearings },
    { data: pendingTasks },
    { data: recentProcesses },
    { data: recentAiRuns },
    { data: snapshot },
    { count: unreadNotifications },
    { data: taskCounts },
  ] = await Promise.all([
    supabase
      .from("deadlines")
      .select("id, title, due_date, status, priority, process_id")
      .lte("due_date", endOfDay)
      .neq("status", "completed")
      .order("due_date", { ascending: true })
      .limit(6),
    supabase
      .from("hearings")
      .select("id, title, scheduled_at, location_type, status, process_id")
      .gte("scheduled_at", startOfDay)
      .lte("scheduled_at", in7Days)
      .eq("status", "scheduled")
      .order("scheduled_at", { ascending: true })
      .limit(6),
    supabase
      .from("tasks")
      .select("id, title, status, priority, due_date")
      .neq("status", "done")
      .eq("assigned_to", userId)
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(6),
    supabase
      .from("processes")
      .select("id, number, subject, status, priority, risk_level, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("ai_agent_runs")
      .select("id, agent_type, summary, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("control_center_snapshot").select("*").maybeSingle(),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false),
    supabase.from("tasks").select("status"),
  ]);

  const processIds = Array.from(
    new Set(
      [...(todayDeadlines ?? []), ...(upcomingHearings ?? [])]
        .map((r) => r.process_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  const processNumberById = new Map<string, string>();
  if (processIds.length > 0) {
    const { data: processNumbers } = await supabase
      .from("processes")
      .select("id, number")
      .in("id", processIds);
    processNumbers?.forEach((p) => processNumberById.set(p.id, p.number));
  }

  const tasksByStatus = ["todo", "doing", "waiting", "done"].map((status) => ({
    status,
    count: (taskCounts ?? []).filter((t) => t.status === status).length,
  }));

  return {
    todayDeadlines: (todayDeadlines ?? []).map((d) => ({
      ...d,
      processNumber: d.process_id ? processNumberById.get(d.process_id) : undefined,
    })),
    upcomingHearings: (upcomingHearings ?? []).map((h) => ({
      ...h,
      processNumber: h.process_id ? processNumberById.get(h.process_id) : undefined,
    })),
    pendingTasks: pendingTasks ?? [],
    recentProcesses: recentProcesses ?? [],
    recentAiRuns: recentAiRuns ?? [],
    snapshot,
    unreadNotifications: unreadNotifications ?? 0,
    tasksByStatus,
  };
}
