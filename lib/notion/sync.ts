import { createClient } from "@/lib/supabase/server";
import { getNotionClient } from "@/lib/notion/client";
import { recordMemory } from "@/lib/actions/second-brain";
import type { NotionEntityType, MemoryType } from "@/types/database.types";

/**
 * Bi-directional Notion sync — MVP scope.
 *
 * Push: every process/client (representative entity types; the same
 * `upsertPage` pattern extends directly to hearings/deadlines/tasks) gets
 * mirrored to a page in the office's own Notion database. The first sync
 * creates the page and remembers its id in `notion_sync_links`; later syncs
 * update that same page instead of duplicating it.
 *
 * Pull: `pullWikiIntoSecondBrain` reads the office's Wiki/Knowledge database
 * (procedures, jurisprudence, doctrine, meeting notes, prompt library,
 * policies) and stores each page as a Second Brain memory — since the AI
 * Assistant already does semantic search over Second Brain before answering
 * (see lib/ai/context.ts), this is how "AI reads everything in Notion before
 * answering" is implemented, without duplicating a second retrieval path.
 *
 * Each office configures its own Notion database IDs in Settings >
 * Integrations; required Notion database properties are documented in
 * README.md.
 */

async function getDatabaseId(organizationId: string, entityType: NotionEntityType) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notion_workspaces")
    .select("database_map")
    .eq("organization_id", organizationId)
    .maybeSingle();
  return data?.database_map?.[entityType] ?? null;
}

async function upsertPage(params: {
  organizationId: string;
  entityType: NotionEntityType;
  entityId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: Record<string, any>;
}) {
  const { organizationId, entityType, entityId, properties } = params;
  const notion = getNotionClient();
  const supabase = await createClient();
  const databaseId = await getDatabaseId(organizationId, entityType);

  if (!databaseId) {
    throw new Error(
      `Nenhum banco de dados do Notion configurado para "${entityType}". Configure em Configurações > Integrações.`
    );
  }

  const { data: link } = await supabase
    .from("notion_sync_links")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .maybeSingle();

  if (link) {
    await notion.pages.update({ page_id: link.notion_page_id, properties });
    await supabase
      .from("notion_sync_links")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", link.id);
    return link.notion_page_id;
  }

  const page = await notion.pages.create({
    parent: { database_id: databaseId },
    properties,
  });

  await supabase.from("notion_sync_links").insert({
    organization_id: organizationId,
    entity_type: entityType,
    entity_id: entityId,
    notion_page_id: page.id,
    notion_database_id: databaseId,
    last_synced_at: new Date().toISOString(),
  });

  return page.id;
}

export async function pushProcessToNotion(organizationId: string, processId: string) {
  const supabase = await createClient();
  const { data: process } = await supabase.from("processes").select("*").eq("id", processId).single();
  if (!process) throw new Error("Processo não encontrado");

  return upsertPage({
    organizationId,
    entityType: "process",
    entityId: processId,
    properties: {
      Name: { title: [{ text: { content: process.number } }] },
      Status: { select: { name: process.status } },
      Risco: { select: { name: process.risk_level } },
      Prioridade: { select: { name: process.priority } },
      Vara: { rich_text: [{ text: { content: process.court ?? "" } }] },
      "Parte contrária": { rich_text: [{ text: { content: process.opposing_party ?? "" } }] },
    },
  });
}

export async function pushClientToNotion(organizationId: string, clientId: string) {
  const supabase = await createClient();
  const { data: client } = await supabase.from("clients").select("*").eq("id", clientId).single();
  if (!client) throw new Error("Cliente não encontrado");

  return upsertPage({
    organizationId,
    entityType: "client",
    entityId: clientId,
    properties: {
      Name: { title: [{ text: { content: client.name } }] },
      Email: client.email ? { email: client.email } : undefined,
      Telefone: { phone_number: client.phone ?? null },
      Tipo: { select: { name: client.type } },
    },
  });
}

const WIKI_CATEGORY_TO_MEMORY_TYPE: Record<string, MemoryType> = {
  jurisprudencia: "jurisprudence",
  doutrina: "doctrine",
  procedimento: "procedural_history",
  politica: "procedural_history",
};

/** Pulls the office's Notion knowledge base into Second Brain so the AI reads it before answering. */
export async function pullWikiIntoSecondBrain(organizationId: string) {
  const notion = getNotionClient();
  const databaseId = await getDatabaseId(organizationId, "wiki_page");
  if (!databaseId) {
    throw new Error("Nenhum banco de dados de Wiki do Notion configurado.");
  }

  // The 2025-09 Notion API split "databases" into queryable "data sources" —
  // a database can have several, but offices set up here have exactly one.
  const database = await notion.databases.retrieve({ database_id: databaseId });
  const dataSourceId = "data_sources" in database ? database.data_sources[0]?.id : undefined;
  if (!dataSourceId) {
    throw new Error("O banco de dados de Wiki não possui nenhuma fonte de dados no Notion.");
  }

  const results = await notion.dataSources.query({ data_source_id: dataSourceId });
  let imported = 0;

  for (const page of results.results) {
    if (!("properties" in page)) continue;
    const properties = page.properties as Record<string, { type: string; [key: string]: unknown }>;
    const titleProp = Object.values(properties).find((p) => p.type === "title");
    const title =
      titleProp && titleProp.type === "title"
        ? (titleProp.title as { plain_text: string }[]).map((t) => t.plain_text).join("")
        : "Sem título";

    const blocks = await notion.blocks.children.list({ block_id: page.id });
    const content = blocks.results
      .map((block) => extractPlainText(block))
      .filter(Boolean)
      .join("\n");

    if (!content) continue;

    const categoryProp = Object.values(properties).find((p) => p.type === "select");
    const categoryName =
      categoryProp && categoryProp.type === "select"
        ? (categoryProp.select as { name?: string } | null)?.name?.toLowerCase()
        : undefined;
    const memoryType = (categoryName && WIKI_CATEGORY_TO_MEMORY_TYPE[categoryName]) || "doctrine";

    await recordMemory({
      organizationId,
      type: memoryType,
      title,
      content,
      source: "notion",
    });
    imported += 1;
  }

  const supabase = await createClient();
  await supabase
    .from("notion_workspaces")
    .update({ last_full_sync_at: new Date().toISOString() })
    .eq("organization_id", organizationId);

  return imported;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPlainText(block: any): string {
  const type = block?.type;
  const richText = type ? block[type]?.rich_text : undefined;
  if (!Array.isArray(richText)) return "";
  return richText.map((t: { plain_text: string }) => t.plain_text).join("");
}
