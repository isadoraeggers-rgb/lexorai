import { createClient } from "@/lib/supabase/server";

export async function listDeadlines() {
  const supabase = await createClient();
  const { data: deadlines } = await supabase
    .from("deadlines")
    .select("id, title, description, due_date, status, priority, process_id, reminder_frequency, origin")
    .order("due_date", { ascending: true });

  const processIds = Array.from(
    new Set((deadlines ?? []).map((d) => d.process_id).filter((id): id is string => Boolean(id)))
  );

  const numberById = new Map<string, string>();
  if (processIds.length > 0) {
    const { data: processes } = await supabase.from("processes").select("id, number").in("id", processIds);
    processes?.forEach((p) => numberById.set(p.id, p.number));
  }

  return (deadlines ?? []).map((d) => ({
    ...d,
    processNumber: d.process_id ? numberById.get(d.process_id) : undefined,
  }));
}
