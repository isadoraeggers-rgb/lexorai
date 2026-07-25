import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";
import { getClaudeClient, CLAUDE_MODEL, MAX_TOKENS } from "@/lib/ai/claude";
import { AGENT_CONFIG } from "@/lib/ai/agents";

export async function POST() {
  const session = await getCurrentProfile();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 500 });
  }

  const supabase = await createClient();

  const [{ data: snapshot }, { data: lateDeadlines }, { data: staleProcesses }, { data: docsMissingOcr }] =
    await Promise.all([
      supabase.from("control_center_snapshot").select("*").maybeSingle(),
      supabase
        .from("deadlines")
        .select("title, due_date, process_id")
        .eq("status", "late")
        .order("due_date", { ascending: true })
        .limit(15),
      supabase
        .from("processes")
        .select("number, last_movement_at")
        .eq("status", "active")
        .order("last_movement_at", { ascending: true, nullsFirst: true })
        .limit(15),
      supabase.from("documents").select("name").eq("ocr_ready", false).limit(10),
    ]);

  const prompt = `
Indicadores gerais:
- Processos sem movimentação (30+ dias): ${snapshot?.processes_without_movement ?? 0}
- Prazos atrasados: ${snapshot?.late_deadlines ?? 0}
- Audiências esta semana: ${snapshot?.hearings_this_week ?? 0}
- Tarefas atrasadas: ${snapshot?.tasks_overdue ?? 0}
- Documentos sem OCR: ${snapshot?.documents_missing_ocr ?? 0}

Prazos atrasados (detalhe): ${(lateDeadlines ?? []).map((d) => `${d.title} (venceu ${d.due_date})`).join("; ") || "Nenhum"}

Processos parados: ${(staleProcesses ?? []).map((p) => p.number).join(", ") || "Nenhum"}

Documentos pendentes de OCR: ${(docsMissingOcr ?? []).map((d) => d.name).join(", ") || "Nenhum"}
`.trim();

  const anthropic = getClaudeClient();
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: MAX_TOKENS,
    system: AGENT_CONFIG.controladoria.systemPrompt,
    messages: [{ role: "user", content: prompt }],
  });

  const summary = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  await supabase.from("ai_agent_runs").insert({
    organization_id: session.profile.organization_id,
    agent_type: "controladoria",
    summary,
    details: { snapshot },
  });

  return NextResponse.json({ summary });
}
