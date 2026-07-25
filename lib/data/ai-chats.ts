import { createClient } from "@/lib/supabase/server";

export async function listChats(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_chats")
    .select("id, title, agent_type, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

export async function getChatMessages(chatId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_messages")
    .select("id, role, content, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
  return data ?? [];
}
