import { createClient } from "@/lib/supabase/server";
import type { TemplateCategory } from "@/types/database.types";

export async function listTemplates() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("templates")
    .select("id, name, category, description, usage_count, is_active, updated_at")
    .order("category")
    .order("name");
  return data ?? [];
}

export async function getTemplate(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("templates").select("*").eq("id", id).single();
  return data;
}

/** Used by the AI Assistant / agents so drafts always start from the office's own templates. */
export async function findTemplatesForCategory(category: TemplateCategory, limit = 3) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("templates")
    .select("id, name, content, variables")
    .eq("category", category)
    .eq("is_active", true)
    .order("usage_count", { ascending: false })
    .limit(limit);
  return data ?? [];
}
