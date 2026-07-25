"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";
import { generateEmbedding } from "@/lib/ai/embeddings";
import type { MemoryType } from "@/types/database.types";

export type MemoryActionState = { error?: string } | undefined;

export async function createMemory(
  _prevState: MemoryActionState,
  formData: FormData
): Promise<MemoryActionState> {
  const session = await getCurrentProfile();
  if (!session) return { error: "Sessão expirada." };

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!title || !content) return { error: "Preencha título e conteúdo." };

  const supabase = await createClient();

  let embedding: number[] | null = null;
  try {
    embedding = await generateEmbedding(`${title}\n\n${content}`);
  } catch {
    // Semantic search stays unavailable for this memory until embeddings are
    // configured; the memory is still stored and browsable/filterable.
  }

  const { error } = await supabase.from("second_brain_memories").insert({
    organization_id: session.profile.organization_id,
    type: (String(formData.get("type") ?? "note")) as MemoryType,
    title,
    content,
    process_id: String(formData.get("process_id") ?? "") || null,
    client_id: String(formData.get("client_id") ?? "") || null,
    source: "manual",
    embedding,
    created_by: session.profile.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/second-brain");
  return undefined;
}

export async function deleteMemory(memoryId: string) {
  const supabase = await createClient();
  await supabase.from("second_brain_memories").delete().eq("id", memoryId);
  revalidatePath("/second-brain");
}

/**
 * Stores a memory programmatically (called by AI agents/services after a
 * hearing, AI conversation, or process summary — not a user-facing action).
 */
export async function recordMemory(params: {
  organizationId: string;
  type: MemoryType;
  title: string;
  content: string;
  processId?: string | null;
  clientId?: string | null;
  source?: string;
}) {
  const supabase = await createClient();
  let embedding: number[] | null = null;
  try {
    embedding = await generateEmbedding(`${params.title}\n\n${params.content}`);
  } catch {
    // stored without embedding; can be backfilled later
  }

  await supabase.from("second_brain_memories").insert({
    organization_id: params.organizationId,
    type: params.type,
    title: params.title,
    content: params.content,
    process_id: params.processId ?? null,
    client_id: params.clientId ?? null,
    source: params.source ?? "agent",
    embedding,
  });
}
