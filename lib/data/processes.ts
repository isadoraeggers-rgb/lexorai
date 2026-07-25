import { createClient } from "@/lib/supabase/server";
import type { ProcessStatus } from "@/types/database.types";

export async function listProcesses(opts?: { search?: string; status?: ProcessStatus }) {
  const supabase = await createClient();
  let query = supabase
    .from("processes")
    .select("id, number, subject, court, opposing_party, status, priority, risk_level, updated_at")
    .order("updated_at", { ascending: false });

  if (opts?.search && opts.search.trim().length > 0) {
    const term = opts.search.trim();
    query = query.or(`number.ilike.%${term}%,subject.ilike.%${term}%,opposing_party.ilike.%${term}%`);
  }

  if (opts?.status) {
    query = query.eq("status", opts.status);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getProcess(id: string) {
  const supabase = await createClient();

  const [
    { data: process },
    { data: clientLinks },
    { data: deadlines },
    { data: hearings },
    { data: documents },
    { data: notes },
    { data: timeline },
  ] = await Promise.all([
    supabase.from("processes").select("*").eq("id", id).single(),
    supabase.from("process_clients").select("client_id, role").eq("process_id", id),
    supabase
      .from("deadlines")
      .select("id, title, due_date, status, priority")
      .eq("process_id", id)
      .order("due_date", { ascending: true }),
    supabase
      .from("hearings")
      .select("id, title, scheduled_at, status, location_type")
      .eq("process_id", id)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("documents")
      .select("id, name, file_type, created_at")
      .eq("process_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("notes")
      .select("id, body, created_at")
      .eq("process_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("process_timeline_events")
      .select("id, event_type, title, description, created_at")
      .eq("process_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const clientIds = (clientLinks ?? []).map((c) => c.client_id);
  const [{ data: clients }, lawyer, responsible] = await Promise.all([
    clientIds.length > 0
      ? supabase.from("clients").select("id, name, email, phone").in("id", clientIds)
      : Promise.resolve({ data: [] }),
    process?.lawyer_id
      ? supabase.from("profiles").select("id, full_name, avatar_url").eq("id", process.lawyer_id).maybeSingle()
      : Promise.resolve({ data: null }),
    process?.responsible_user_id
      ? supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", process.responsible_user_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    process,
    clients: clients ?? [],
    lawyer: lawyer.data,
    responsible: responsible.data,
    deadlines: deadlines ?? [],
    hearings: hearings ?? [],
    documents: documents ?? [],
    notes: notes ?? [],
    timeline: timeline ?? [],
  };
}
