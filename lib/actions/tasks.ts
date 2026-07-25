"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";
import type { TaskStatus, PriorityLevel } from "@/types/database.types";

export type TaskActionState = { error?: string } | undefined;

function nullable(value: FormDataEntryValue | null) {
  const str = String(value ?? "").trim();
  return str.length > 0 ? str : null;
}

export async function createTask(
  _prevState: TaskActionState,
  formData: FormData
): Promise<TaskActionState> {
  const session = await getCurrentProfile();
  if (!session) return { error: "Sessão expirada." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Informe um título." };

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    organization_id: session.profile.organization_id,
    title,
    description: nullable(formData.get("description")),
    priority: (String(formData.get("priority") ?? "medium")) as PriorityLevel,
    due_date: nullable(formData.get("due_date")),
    process_id: nullable(formData.get("process_id")),
    assigned_to: nullable(formData.get("assigned_to")) ?? session.profile.id,
    created_by: session.profile.id,
    status: "todo",
  });

  if (error) return { error: error.message };

  revalidatePath("/tasks");
  return undefined;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const supabase = await createClient();
  await supabase.from("tasks").update({ status }).eq("id", taskId);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();
  await supabase.from("tasks").delete().eq("id", taskId);
  revalidatePath("/tasks");
}

export async function addTaskComment(taskId: string, formData: FormData) {
  const session = await getCurrentProfile();
  if (!session) return;
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const supabase = await createClient();
  await supabase.from("task_comments").insert({
    task_id: taskId,
    author_id: session.profile.id,
    body,
  });

  revalidatePath("/tasks");
}
