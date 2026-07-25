import { createClient } from "@/lib/supabase/server";

export async function listAllMembers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, avatar_url, is_active, created_at")
    .order("created_at");
  return data ?? [];
}
