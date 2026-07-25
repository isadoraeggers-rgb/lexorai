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

  const { periodLabel } = await request.json().catch(() => ({ periodLabel: "semana" }));
  const supabase = await createClient();

  const [{ count: processesCount }, { count: tasksDone }, { count: hearingsCount }, { data: byLawyer }] =
    await Promise.all([
      supabase.from("processes").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("status", "done"),
      supabase.from("hearings").select("id", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("processes").select("lawyer_id"),
    ]);

  const perLawyer = new Map<string, number>();
  (byLawyer ?? []).forEach((p) => {
    if (p.lawyer_id) perLawyer.set(p.lawyer_id, (perLawyer.get(p.lawyer_id) ?? 0) + 1);
  });

  const prompt = `
Período: ${periodLabel}
Processos ativos: ${processesCount ?? 0}
Tarefas concluídas: ${tasksDone ?? 0}
Audiências realizadas: ${hearingsCount ?? 0}
Distribuição de processos por advogado (id -> quantidade): ${JSON.stringify(Object.fromEntries(perLawyer))}
`.trim();

  const anthropic = getClaudeClient();
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: MAX_TOKENS,
    system: AGENT_CONFIG.office_manager.systemPrompt,
    messages: [{ role: "user", content: prompt }],
  });

  const summary = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  await supabase.from("ai_agent_runs").insert({
    organization_id: session.profile.organization_id,
    agent_type: "office_manager",
    summary,
    details: { periodLabel },
  });

  return NextResponse.json({ summary });
}
