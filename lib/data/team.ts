import { createClient } from "@/lib/supabase/server";

export async function listTeamMembers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, is_active")
    .eq("is_active", true)
    .order("full_name");
  return data ?? [];
}
