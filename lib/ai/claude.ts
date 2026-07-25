import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getClaudeClient() {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

/**
 * Configurable via ANTHROPIC_MODEL so the office can point this at whichever
 * Claude model their API key has access to without a code change.
 */
export const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";

export const MAX_TOKENS = 4096;
