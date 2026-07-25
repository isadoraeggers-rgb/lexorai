import { Client } from "@notionhq/client";

let client: Client | null = null;

/**
 * Single office-wide Notion integration token. Per-organization database IDs
 * live in `notion_workspaces.database_map` (see lib/notion/sync.ts) so one
 * integration can serve multiple offices, each pointing at their own
 * databases inside their own Notion workspace.
 */
export function getNotionClient() {
  if (!process.env.NOTION_API_KEY) {
    throw new Error(
      "NOTION_API_KEY não configurada. Configure a integração em Configurações > Integrações."
    );
  }
  if (!client) {
    client = new Client({ auth: process.env.NOTION_API_KEY });
  }
  return client;
}
