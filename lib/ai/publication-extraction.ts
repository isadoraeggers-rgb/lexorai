import { getClaudeClient, CLAUDE_MODEL } from "@/lib/ai/claude";

export type ExtractedPublication = {
  process_number: string | null;
  court: string | null;
  publication_date: string | null; // YYYY-MM-DD
  deadline_title: string;
  due_date: string | null; // YYYY-MM-DD
  days_to_comply: number | null;
  priority: "low" | "medium" | "high" | "urgent";
  summary: string;
};

const SYSTEM_PROMPT = `Você é o agente de Controladoria Jurídica da Lexora, especializado em ler publicações do
Diário da Justiça e intimações processuais para extrair prazos processuais.

Dado o texto de uma publicação, responda APENAS com um JSON válido (sem markdown, sem texto adicional)
no seguinte formato:

{
  "process_number": string ou null (número do processo no formato CNJ, se identificável),
  "court": string ou null (vara/tribunal),
  "publication_date": string ou null (data de publicação, formato YYYY-MM-DD, se identificável),
  "deadline_title": string (título curto e objetivo do prazo, ex.: "Apresentar contestação"),
  "due_date": string ou null (data limite calculada, formato YYYY-MM-DD; se a publicação menciona
    "prazo de N dias" a partir da publicação/ciência, calcule a data adicionando N dias corridos à
    publication_date quando esta for conhecida; caso não seja possível calcular com segurança, use null),
  "days_to_comply": number ou null (quantidade de dias do prazo mencionado no texto),
  "priority": "low" | "medium" | "high" | "urgent" (urgent se o prazo for de até 5 dias corridos),
  "summary": string (resumo de uma frase do que precisa ser feito)
}`;

export async function extractPublicationDeadline(rawText: string): Promise<ExtractedPublication> {
  const anthropic = getClaudeClient();
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: rawText.slice(0, 8000) }],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Não foi possível extrair um prazo estruturado desta publicação.");
  }

  return JSON.parse(jsonMatch[0]) as ExtractedPublication;
}
