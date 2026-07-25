"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";
import { oabRegistrationSchema } from "@/lib/validation/oab";

export type OabActionState = { error?: string; success?: boolean } | undefined;

export async function createOabRegistration(
  _prevState: OabActionState,
  formData: FormData
): Promise<OabActionState> {
  const session = await getCurrentProfile();
  if (!session) return { error: "Sessão expirada." };

  const parsed = oabRegistrationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const profileId = String(formData.get("profile_id") ?? "").trim() || session.profile.id;
  const practiceAreas = parsed.data.practice_areas
    ? parsed.data.practice_areas.split(",").map((a) => a.trim()).filter(Boolean)
    : [];

  const supabase = await createClient();
  const { error } = await supabase.from("oab_registrations").insert({
    organization_id: session.profile.organization_id,
    profile_id: profileId,
    oab_number: parsed.data.oab_number,
    oab_state: parsed.data.oab_state,
    practice_areas: practiceAreas,
    is_monitored: formData.get("is_monitored") === "on",
  });

  if (error) {
    return { error: error.message.includes("unique") ? "Esta OAB já está cadastrada." : error.message };
  }

  revalidatePath("/settings/oab");
  revalidatePath("/onboarding");
  revalidatePath("/deadlines/monitoring");
  return { success: true };
}

export async function toggleOabMonitored(oabId: string, monitored: boolean) {
  const supabase = await createClient();
  await supabase.from("oab_registrations").update({ is_monitored: monitored }).eq("id", oabId);
  revalidatePath("/settings/oab");
  revalidatePath("/deadlines/monitoring");
}

export async function toggleOabActive(oabId: string, active: boolean) {
  const supabase = await createClient();
  await supabase
    .from("oab_registrations")
    .update({ is_active: active, is_monitored: active ? undefined : false })
    .eq("id", oabId);
  revalidatePath("/settings/oab");
  revalidatePath("/deadlines/monitoring");
}

export async function deleteOabRegistration(oabId: string) {
  const supabase = await createClient();
  await supabase.from("oab_registrations").delete().eq("id", oabId);
  revalidatePath("/settings/oab");
  revalidatePath("/deadlines/monitoring");
}
