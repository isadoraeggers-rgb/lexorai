"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";
import type { HearingLocationType, HearingStatus } from "@/types/database.types";

export type HearingActionState = { error?: string } | undefined;

function nullable(value: FormDataEntryValue | null) {
  const str = String(value ?? "").trim();
  return str.length > 0 ? str : null;
}

export async function createHearing(
  _prevState: HearingActionState,
  formData: FormData
): Promise<HearingActionState> {
  const session = await getCurrentProfile();
  if (!session) return { error: "Sessão expirada." };

  const title = String(formData.get("title") ?? "").trim();
  const scheduledAt = String(formData.get("scheduled_at") ?? "");
  if (!title || !scheduledAt) return { error: "Preencha título e data." };

  const supabase = await createClient();
  const { data: hearing, error } = await supabase
    .from("hearings")
    .insert({
      organization_id: session.profile.organization_id,
      title,
      hearing_type: nullable(formData.get("hearing_type")),
      scheduled_at: new Date(scheduledAt).toISOString(),
      duration_minutes: Number(formData.get("duration_minutes") ?? 60),
      location_type: (String(formData.get("location_type") ?? "in_person")) as HearingLocationType,
      address: nullable(formData.get("address")),
      meet_url: nullable(formData.get("meet_url")),
      judge: nullable(formData.get("judge")),
      process_id: nullable(formData.get("process_id")),
      created_by: session.profile.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/hearings");
  redirect(`/hearings/${hearing.id}`);
}

export async function updateHearingStatus(hearingId: string, status: HearingStatus) {
  const supabase = await createClient();
  await supabase.from("hearings").update({ status }).eq("id", hearingId);
  revalidatePath("/hearings");
  revalidatePath(`/hearings/${hearingId}`);
}

export async function addHearingChecklistItem(hearingId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const supabase = await createClient();
  await supabase.from("hearing_checklist_items").insert({ hearing_id: hearingId, title });
  revalidatePath(`/hearings/${hearingId}`);
}

export async function toggleHearingChecklistItem(hearingId: string, itemId: string, done: boolean) {
  const supabase = await createClient();
  await supabase.from("hearing_checklist_items").update({ is_done: done }).eq("id", itemId);
  revalidatePath(`/hearings/${hearingId}`);
}

export async function addHearingParticipant(hearingId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const supabase = await createClient();
  await supabase.from("hearing_participants").insert({
    hearing_id: hearingId,
    name,
    role: nullable(formData.get("role")),
    email: nullable(formData.get("email")),
  });
  revalidatePath(`/hearings/${hearingId}`);
}

export async function deleteHearing(hearingId: string) {
  const supabase = await createClient();
  await supabase.from("hearings").delete().eq("id", hearingId);
  revalidatePath("/hearings");
  redirect("/hearings");
}
