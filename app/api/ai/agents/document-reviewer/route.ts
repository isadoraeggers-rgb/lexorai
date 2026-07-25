import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";
import { getClaudeClient, CLAUDE_MODEL, MAX_TOKENS } from "@/lib/ai/claude";
import { AGENT_CONFIG } from "@/lib/ai/agents";

export async function POST(request: Request) {
  const session = await getCurrentProfile();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 500 });
  }

  const { text, documentId } = await request.json();
  if (!text || String(text).trim().length < 20) {
    return NextResponse.json({ error: "Cole o texto do documento (mínimo 20 caracteres)." }, { status: 400 });
  }

  const anthropic = getClaudeClient();
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: MAX_TOKENS,
    system: AGENT_CONFIG.document_reviewer.systemPrompt,
    messages: [{ role: "user", content: String(text).slice(0, 20000) }],
  });

  const review = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  const supabase = await createClient();
  await supabase.from("ai_agent_runs").insert({
    organization_id: session.profile.organization_id,
    agent_type: "document_reviewer",
    summary: "Revisão de documento gerada",
    details: { documentId: documentId ?? null },
  });

  return NextResponse.json({ review });
}
