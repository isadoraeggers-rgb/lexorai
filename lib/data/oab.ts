import { createClient } from "@/lib/supabase/server";

export async function listOabRegistrations(organizationId: string) {
  const supabase = await createClient();
  const { data: registrations } = await supabase
    .from("oab_registrations")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });

  const profileIds = Array.from(
    new Set((registrations ?? []).map((r) => r.profile_id).filter((id): id is string => Boolean(id)))
  );
  const nameById = new Map<string, string>();
  if (profileIds.length > 0) {
    const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", profileIds);
    profiles?.forEach((p) => nameById.set(p.id, p.full_name));
  }

  return (registrations ?? []).map((r) => ({
    ...r,
    lawyerName: r.profile_id ? nameById.get(r.profile_id) : undefined,
  }));
}

export async function getMonitoringStatus(organizationId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deadline_monitoring_status")
    .select("monitoring_enabled")
    .eq("organization_id", organizationId)
    .maybeSingle();
  return data?.monitoring_enabled ?? false;
}

export async function listMonitoredPublications(organizationId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("monitored_publications")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}
