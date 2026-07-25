"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";

export type NotionActionState = { error?: string; success?: boolean } | undefined;

export async function saveNotionDatabaseMap(
  _prevState: NotionActionState,
  formData: FormData
): Promise<NotionActionState> {
  const session = await getCurrentProfile();
  if (!session) return { error: "Sessão expirada." };
  if (session.profile.role !== "owner" && session.profile.role !== "admin") {
    return { error: "Apenas administradores podem configurar integrações." };
  }

  const databaseMap = {
    process: String(formData.get("process_db") ?? "").trim() || undefined,
    client: String(formData.get("client_db") ?? "").trim() || undefined,
    hearing: String(formData.get("hearing_db") ?? "").trim() || undefined,
    deadline: String(formData.get("deadline_db") ?? "").trim() || undefined,
    task: String(formData.get("task_db") ?? "").trim() || undefined,
    wiki_page: String(formData.get("wiki_db") ?? "").trim() || undefined,
  };

  const supabase = await createClient();
  const { error } = await supabase.from("notion_workspaces").upsert({
    organization_id: session.profile.organization_id,
    database_map: databaseMap,
  });

  if (error) return { error: error.message };

  revalidatePath("/settings/integrations");
  return { success: true };
}
