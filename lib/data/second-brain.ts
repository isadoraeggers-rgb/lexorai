import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/ai/embeddings";
import type { MemoryType } from "@/types/database.types";

export async function listRecentMemories(type?: MemoryType) {
  const supabase = await createClient();
  let query = supabase
    .from("second_brain_memories")
    .select("id, type, title, content, process_id, client_id, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  if (type) query = query.eq("type", type);

  const { data } = await query;
  return data ?? [];
}

export async function semanticSearchMemories(query: string, type?: MemoryType) {
  const supabase = await createClient();
  const embedding = await generateEmbedding(query);

  const { data, error } = await supabase.rpc("match_second_brain_memories", {
    query_embedding: embedding,
    match_count: 12,
    filter_type: type ?? null,
    filter_process_id: null,
    filter_client_id: null,
  });

  if (error) throw new Error(error.message);
  return data ?? [];
}
