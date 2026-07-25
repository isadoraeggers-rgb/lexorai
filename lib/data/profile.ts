import { createClient } from "@/lib/supabase/server";
import type { Organization, Profile } from "@/types/database.types";

export async function getCurrentProfile(): Promise<{
  profile: Profile;
  organization: Organization;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", profile.organization_id)
    .single();

  if (!organization) return null;

  return { profile: profile as Profile, organization: organization as Organization };
}
