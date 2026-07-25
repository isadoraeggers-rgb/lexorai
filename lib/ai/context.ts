import { findTemplatesForCategory } from "@/lib/data/templates";
import { semanticSearchMemories } from "@/lib/data/second-brain";
import { buildContextBlock, AGENT_CONFIG } from "@/lib/ai/agents";
import type { AiAgentType } from "@/types/database.types";

/**
 * Gathers office templates + Second Brain memories relevant to the user's
 * message so every agent answers grounded in the firm's own material instead
 * of generic knowledge. Failures (e.g. missing OPENAI_API_KEY) are swallowed —
 * the agent still runs, just without semantic recall for that turn.
 */
export async function gatherAgentContext(agentType: AiAgentType, userMessage: string) {
  const sections: { title: string; content: string }[] = [];
  const config = AGENT_CONFIG[agentType];

  if (config.templateCategory) {
    try {
      const templates = await findTemplatesForCategory(config.templateCategory);
      if (templates.length > 0) {
        sections.push({
          title: `Modelos do escritório (${config.templateCategory})`,
          content: templates
            .map((t) => `**${t.name}**\n${t.content}`)
            .join("\n\n---\n\n"),
        });
      }
    } catch {
      // template lookup failing is non-fatal
    }
  }

  try {
    const memories = await semanticSearchMemories(userMessage);
    if (memories.length > 0) {
      sections.push({
        title: "Memórias relevantes do Second Brain",
        content: memories
          .map((m) => `[${m.type}] ${m.title}: ${m.content}`)
          .join("\n"),
      });
    }
  } catch {
    // semantic search unavailable (no OPENAI_API_KEY) — proceed without it
  }

  return buildContextBlock(sections);
}
