import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";
import { getProcess } from "@/lib/data/processes";
import { getClaudeClient, CLAUDE_MODEL, MAX_TOKENS } from "@/lib/ai/claude";
import { AGENT_CONFIG } from "@/lib/ai/agents";
import { recordMemory } from "@/lib/actions/second-brain";

export async function POST(request: Request) {
  const session = await getCurrentProfile();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 500 });
  }

  const { processId } = await request.json();
  if (!processId) return NextResponse.json({ error: "processId é obrigatório" }, { status: 400 });

  const { process: proc, clients, deadlines, hearings } = await getProcess(processId);
  if (!proc) return NextResponse.json({ error: "Processo não encontrado" }, { status: 404 });

  const prompt = `
Número: ${proc.number}
Vara/Tribunal: ${proc.court ?? "N/A"}
Classe: ${proc.class ?? "N/A"}
Assunto: ${proc.subject ?? "N/A"}
Parte contrária: ${proc.opposing_party ?? "N/A"}
Status atual: ${proc.status}
Prioridade atual: ${proc.priority}
Risco atual: ${proc.risk_level}
Valor da causa: ${proc.case_value ?? "N/A"}
Clientes: ${clients.map((c) => c.name).join(", ") || "N/A"}
Prazos: ${deadlines.map((d) => `${d.title} (${d.status}, vence ${d.due_date})`).join("; ") || "Nenhum"}
Audiências: ${hearings.map((h) => `${h.title} em ${h.scheduled_at} (${h.status})`).join("; ") || "Nenhuma"}
`.trim();

  const anthropic = getClaudeClient();
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: MAX_TOKENS,
    system: AGENT_CONFIG.case_analyst.systemPrompt,
    messages: [{ role: "user", content: prompt }],
  });

  const summary = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  const supabase = await createClient();
  await supabase
    .from("processes")
    .update({ ai_summary: summary, ai_summary_updated_at: new Date().toISOString() })
    .eq("id", processId);

  await supabase.from("ai_agent_runs").insert({
    organization_id: session.profile.organization_id,
    agent_type: "case_analyst",
    summary: `Resumo gerado para o processo ${proc.number}`,
    details: { processId },
    process_id: processId,
  });

  await recordMemory({
    organizationId: session.profile.organization_id,
    type: "process_summary",
    title: `Resumo IA — Processo ${proc.number}`,
    content: summary,
    processId,
    source: "case_analyst",
  });

  return NextResponse.json({ summary });
}
