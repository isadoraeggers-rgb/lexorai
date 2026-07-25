import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";
import { getClaudeClient, CLAUDE_MODEL, MAX_TOKENS } from "@/lib/ai/claude";
import { AGENT_CONFIG } from "@/lib/ai/agents";
import { gatherAgentContext } from "@/lib/ai/context";
import type { AiAgentType, AiMessageRole } from "@/types/database.types";

export async function POST(request: Request) {
  const session = await getCurrentProfile();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const message = String(body.message ?? "").trim();
  const agentType = (body.agentType ?? "assistant") as AiAgentType;
  const processId: string | null = body.processId ?? null;
  const clientId: string | null = body.clientId ?? null;
  let chatId: string | null = body.chatId ?? null;

  if (!message) {
    return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada no servidor." },
      { status: 500 }
    );
  }

  const supabase = await createClient();

  if (!chatId) {
    const { data: chat, error } = await supabase
      .from("ai_chats")
      .insert({
        organization_id: session.profile.organization_id,
        user_id: session.profile.id,
        agent_type: agentType,
        title: message.slice(0, 60),
        process_id: processId,
        client_id: clientId,
      })
      .select("id")
      .single();

    if (error || !chat) {
      return NextResponse.json({ error: error?.message ?? "Falha ao criar conversa" }, { status: 500 });
    }
    chatId = chat.id;
  }

  await supabase.from("ai_messages").insert({ chat_id: chatId, role: "user", content: message });

  const { data: history } = await supabase
    .from("ai_messages")
    .select("role, content")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  const contextBlock = await gatherAgentContext(agentType, message);
  const config = AGENT_CONFIG[agentType];

  const anthropic = getClaudeClient();
  const claudeMessages = (history ?? [])
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const encoder = new TextEncoder();
  let fullText = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = anthropic.messages.stream({
          model: CLAUDE_MODEL,
          max_tokens: MAX_TOKENS,
          system: config.systemPrompt + contextBlock,
          messages: claudeMessages,
        });

        claudeStream.on("text", (delta) => {
          fullText += delta;
          controller.enqueue(encoder.encode(delta));
        });

        await claudeStream.finalMessage();

        await supabase.from("ai_messages").insert({
          chat_id: chatId,
          role: "assistant" as AiMessageRole,
          content: fullText,
        });
        await supabase.from("ai_chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId);

        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `\n\n[Erro ao gerar resposta: ${err instanceof Error ? err.message : "desconhecido"}]`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Chat-Id": chatId,
    },
  });
}
