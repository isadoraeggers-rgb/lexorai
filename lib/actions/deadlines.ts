"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";
import type { PriorityLevel, ReminderFrequency } from "@/types/database.types";

export type DeadlineActionState = { error?: string } | undefined;

function nullable(value: FormDataEntryValue | null) {
  const str = String(value ?? "").trim();
  return str.length > 0 ? str : null;
}

export async function createDeadline(
  _prevState: DeadlineActionState,
  formData: FormData
): Promise<DeadlineActionState> {
  const session = await getCurrentProfile();
  if (!session) return { error: "Sessão expirada." };

  const title = String(formData.get("title") ?? "").trim();
  const dueDate = String(formData.get("due_date") ?? "");
  if (!title || !dueDate) return { error: "Preencha título e data." };

  const supabase = await createClient();
  const { error } = await supabase.from("deadlines").insert({
    organization_id: session.profile.organization_id,
    title,
    description: nullable(formData.get("description")),
    due_date: new Date(dueDate).toISOString(),
    priority: (String(formData.get("priority") ?? "medium")) as PriorityLevel,
    reminder_frequency: (String(formData.get("reminder_frequency") ?? "weekly")) as ReminderFrequency,
    process_id: nullable(formData.get("process_id")),
    responsible_user_id: nullable(formData.get("responsible_user_id")) ?? session.profile.id,
    created_by: session.profile.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/deadlines");
  return undefined;
}

export async function toggleDeadlineComplete(deadlineId: string, completed: boolean) {
  const session = await getCurrentProfile();
  const supabase = await createClient();

  await supabase
    .from("deadlines")
    .update({
      completed_at: completed ? new Date().toISOString() : null,
      completed_by: completed ? session?.profile.id ?? null : null,
    })
    .eq("id", deadlineId);

  revalidatePath("/deadlines");
  revalidatePath("/dashboard");
}

export async function deleteDeadline(deadlineId: string) {
  const supabase = await createClient();
  await supabase.from("deadlines").delete().eq("id", deadlineId);
  revalidatePath("/deadlines");
}
