"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";
import type { TemplateCategory } from "@/types/database.types";

export type TemplateActionState = { error?: string } | undefined;

export async function createTemplate(
  _prevState: TemplateActionState,
  formData: FormData
): Promise<TemplateActionState> {
  const session = await getCurrentProfile();
  if (!session) return { error: "Sessão expirada." };

  const name = String(formData.get("name") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!name || !content) return { error: "Preencha nome e conteúdo." };

  const supabase = await createClient();
  const { data: template, error } = await supabase
    .from("templates")
    .insert({
      organization_id: session.profile.organization_id,
      name,
      category: (String(formData.get("category") ?? "petition")) as TemplateCategory,
      description: String(formData.get("description") ?? "").trim() || null,
      content,
      created_by: session.profile.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/templates");
  redirect(`/templates/${template.id}`);
}

export async function updateTemplate(
  templateId: string,
  _prevState: TemplateActionState,
  formData: FormData
): Promise<TemplateActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!name || !content) return { error: "Preencha nome e conteúdo." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("templates")
    .update({
      name,
      category: (String(formData.get("category") ?? "petition")) as TemplateCategory,
      description: String(formData.get("description") ?? "").trim() || null,
      content,
    })
    .eq("id", templateId);

  if (error) return { error: error.message };

  revalidatePath("/templates");
  revalidatePath(`/templates/${templateId}`);
  redirect(`/templates/${templateId}`);
}

export async function deleteTemplate(templateId: string) {
  const supabase = await createClient();
  await supabase.from("templates").delete().eq("id", templateId);
  revalidatePath("/templates");
  redirect("/templates");
}
