import { createClient } from "@/lib/supabase/server";

export async function listClients(search?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("clients")
    .select("id, type, name, cpf, cnpj, email, phone, tags, is_active, created_at")
    .order("created_at", { ascending: false });

  if (search && search.trim().length > 0) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getClient(id: string) {
  const supabase = await createClient();

  const [{ data: client }, { data: processLinks }, { data: documents }, { data: notes }, { data: timeline }] =
    await Promise.all([
      supabase.from("clients").select("*").eq("id", id).single(),
      supabase.from("process_clients").select("process_id, role").eq("client_id", id),
      supabase
        .from("documents")
        .select("id, name, file_type, size_bytes, created_at")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("notes")
        .select("id, body, created_at, author_id")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("client_timeline_events")
        .select("id, event_type, title, description, created_at")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
    ]);

  const processIds = (processLinks ?? []).map((p) => p.process_id);
  const { data: processes } =
    processIds.length > 0
      ? await supabase.from("processes").select("id, number, subject, status").in("id", processIds)
      : { data: [] };

  return {
    client,
    processes: processes ?? [],
    documents: documents ?? [],
    notes: notes ?? [],
    timeline: timeline ?? [],
  };
}
