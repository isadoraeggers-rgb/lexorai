import type { MemoryType } from "@/types/database.types";

export const MEMORY_TYPE_LABEL: Record<MemoryType, string> = {
  decision: "Decisão",
  strategy: "Estratégia",
  note: "Nota",
  hearing_record: "Registro de audiência",
  ai_conversation: "Conversa com IA",
  process_summary: "Resumo de processo",
  client_preference: "Preferência de cliente",
  procedural_history: "Histórico processual",
  jurisprudence: "Jurisprudência",
  doctrine: "Doutrina",
};
