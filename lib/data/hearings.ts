import { createClient } from "@/lib/supabase/server";

export async function listHearings() {
  const supabase = await createClient();
  const { data: hearings } = await supabase
    .from("hearings")
    .select("id, title, scheduled_at, status, location_type, process_id, judge")
    .order("scheduled_at", { ascending: true });

  const processIds = Array.from(
    new Set((hearings ?? []).map((h) => h.process_id).filter((id): id is string => Boolean(id)))
  );
  const numberById = new Map<string, string>();
  if (processIds.length > 0) {
    const { data: processes } = await supabase.from("processes").select("id, number").in("id", processIds);
    processes?.forEach((p) => numberById.set(p.id, p.number));
  }

  return (hearings ?? []).map((h) => ({
    ...h,
    processNumber: h.process_id ? numberById.get(h.process_id) : undefined,
  }));
}

export async function getHearing(id: string) {
  const supabase = await createClient();
  const [{ data: hearing }, { data: checklist }, { data: participants }, { data: attachments }] =
    await Promise.all([
      supabase.from("hearings").select("*").eq("id", id).single(),
      supabase
        .from("hearing_checklist_items")
        .select("*")
        .eq("hearing_id", id)
        .order("order_index", { ascending: true }),
      supabase.from("hearing_participants").select("*").eq("hearing_id", id),
      supabase.from("hearing_attachments").select("*").eq("hearing_id", id),
    ]);

  let processNumber: string | undefined;
  if (hearing?.process_id) {
    const { data: process } = await supabase
      .from("processes")
      .select("number")
      .eq("id", hearing.process_id)
      .maybeSingle();
    processNumber = process?.number;
  }

  return {
    hearing,
    processNumber,
    checklist: checklist ?? [],
    participants: participants ?? [],
    attachments: attachments ?? [],
  };
}
