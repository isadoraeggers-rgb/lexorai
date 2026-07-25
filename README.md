# Lexora — Legal Operating System

Lexora is an AI-powered Legal Operating System: the lawyer's second brain. It
unifies clients, processes, deadlines, hearings, tasks, documents, templates
and an AI assistant into a single, fast, premium workspace — inspired by
Linear, Notion, Raycast and Stripe Dashboard.

## Tech stack

| Layer      | Choice                                                                 |
| ---------- | ----------------------------------------------------------------------- |
| Frontend   | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide Icons |
| UI kit     | Hand-built shadcn/ui-style components on Radix primitives (see "Why no shadcn CLI" below) |
| Backend    | Supabase (PostgreSQL, Auth, Storage, Row Level Security)                |
| AI         | Claude API (`@anthropic-ai/sdk`) for chat + 5 specialized agents; OpenAI embeddings for Second Brain semantic search |
| Calendar   | FullCalendar (month/week/agenda, drag-and-drop)                        |
| Charts     | Recharts                                                                 |
| Exports    | jsPDF + jspdf-autotable (PDF), SheetJS `xlsx` (Excel) — both lazy-loaded |
| Knowledge  | Notion API (`@notionhq/client`) for bi-directional sync                |

## Architecture

```
src/
  app/
    (auth)/            login, signup, forgot-password — split-screen branded layout
    onboarding/         mandatory first-time setup wizard (blocks the app until done)
    (app)/              the authenticated product, one folder per module:
      dashboard/  clients/  processes/  deadlines/ (+ monitoring)  hearings/
      tasks/  documents/  templates/  second-brain/  ai/  control-center/
      calendar/  reports/  notifications/  settings/ (+ oab, integrations, team)
    api/
      ai/               chat streaming + 5 agent endpoints
      notion/           push/pull sync endpoints
      monitoring/        publication → deadline AI-extraction ingestion endpoint
      documents/         signed URL redirect for preview/download
      search/, tasks/, second-brain/   supporting endpoints
    auth/callback/       Supabase Auth OAuth/email confirmation callback
  components/
    ui/                 shadcn-style primitives (button, card, dialog, ...)
    layout/             sidebar, topbar, command palette, notifications
    <module>/           module-specific components
  lib/
    supabase/           browser / server / middleware clients
    actions/            Server Actions (mutations) per module
    data/                data-fetching helpers per module (Server Components)
    ai/                  Claude client, the 5 agent system prompts, RAG context builder
    notion/              Notion client + sync engine
    export/              PDF/Excel export helpers
  types/
    database.types.ts    hand-maintained mirror of the Supabase schema
supabase/
  migrations/            15 ordered SQL migrations (schema + RLS + triggers)
  seed.sql               realistic demo data (see "Demo data" below)
```

### Data model

Normalized PostgreSQL schema across `supabase/migrations/`: organizations,
profiles (roles: owner/admin/lawyer/paralegal/financial/viewer), clients,
processes (+ `process_clients` many-to-many + timeline), deadlines, hearings
(+ participants + checklist), tasks (+ comments), documents (+ folders, tags,
versions), templates, `second_brain_memories` (pgvector embeddings +
`match_second_brain_memories` RPC for semantic search), `ai_chats` /
`ai_messages` / `ai_agent_runs`, notifications, notes, reports,
`notion_sync_links` / `notion_workspaces`. Every tenant-scoped table has Row
Level Security scoped to the caller's `organization_id` via a
`current_organization_id()` helper function.

### AI Assistant + the 5 agents

One chat UI (`/ai`) with an agent selector, backed by a single streaming
route (`/api/ai/chat`) that swaps the Claude system prompt per agent:

1. **Controladoria Jurídica** — reviews late deadlines, stale processes and
   missing documents, returns a prioritized action list (`/control-center`).
2. **Redator de Petições** — pulls the office's own petition templates first
   (`findTemplatesForCategory`) and drafts from them.
3. **Analista de Casos** — summarizes a process, sets risk level, suggests
   strategy; wired to the "Gerar resumo" button on the process page.
4. **Revisor de Documentos** — reviews pasted contract/document text for
   risky clauses and inconsistencies.
5. **Gestor do Escritório** — generates productivity/financial executive
   reports (`/reports`).

Every agent call runs `gatherAgentContext()` first: it semantically searches
Second Brain and pulls relevant templates, so answers are grounded in the
firm's own material rather than generic knowledge — this is also how "AI
reads the Notion knowledge base before answering" is implemented, since
Notion wiki pages are pulled into Second Brain (see below).

### Mandatory onboarding + OAB deadline monitoring

First login always lands on `/onboarding` — a blocking 3-step wizard
(`(app)/layout.tsx` redirects there until `organizations.onboarding_completed_at`
is set, and `/onboarding` itself redirects to `/dashboard` once it is):

1. **Office** — name, contact e-mail, phone, logo (uploaded to the
   `brand-assets` Storage bucket).
2. **Lawyer** — full name, phone, and the lawyer's own OAB (state + number),
   validated against the `OAB/UF NNNNN` format (`lib/validation/oab.ts`).
3. **Monitoring** — choose which OAB registration(s) to monitor, with the
   option to add more before finishing.

OAB registrations are their own table (`oab_registrations`, one office → many
lawyers → many OAB registrations each, since a lawyer can hold OABs in
multiple states), managed long-term in **Settings → Registros de OAB**
(add/edit/deactivate/toggle-monitored per lawyer, practice areas included).

**Deadline Monitoring** (`/deadlines/monitoring`) stays disabled — showing
"Configure at least one active OAB registration to enable automatic deadline
monitoring." — until at least one OAB is both active and monitored
(`deadline_monitoring_status` view). Once enabled:

- Paste a Diário da Justiça / intimação text into "Colar publicação" and
  `POST /api/monitoring/ingest` runs it through a dedicated Claude extraction
  prompt (`lib/ai/publication-extraction.ts`) that identifies the process
  number, court, publication date and computes the deadline, then
  auto-creates a `deadlines` row (`origin = 'auto_monitoring'`, flagged
  "Detectado por IA" on the Kanban board) and notifies the responsible
  lawyer.
- `monitored_publications` logs every processed publication and links back
  to the deadline it created — this is also the integration point for a real
  Diário da Justiça scraper or third-party webhook later: point it at the
  same endpoint with `{ oabRegistrationId, rawText }` and the pipeline is
  identical. There is no live scraping integration wired up yet (no such data
  source was available to build against), so today it's driven by manual
  paste; the "daily/weekly reports" requirement is covered by the existing
  Reports module and the Office Manager agent rather than a separate report
  generator.

### Notion sync (MVP scope)

`lib/notion/sync.ts` pushes processes and clients to Notion pages (creating
once, updating thereafter via `notion_sync_links`), and pulls the office's
Notion wiki database into Second Brain memories. Hearings/deadlines/tasks
follow the exact same `upsertPage` pattern and can be added by copying
`pushProcessToNotion`. Configure database IDs in **Settings → Integrações**;
required Notion database properties:

- **Processes**: `Name` (title), `Status`, `Risco`, `Prioridade` (selects), `Vara`, `Parte contrária` (rich text)
- **Clients**: `Name` (title), `Email`, `Telefone`, `Tipo` (select)
- **Wiki**: `Name` (title), a `select` property for category (`jurisprudencia`, `doutrina`, `procedimento`, `politica`) — page body becomes the memory content

Requires `NOTION_API_KEY` (a single Notion internal integration shared by the
Next.js server; each office's own database IDs keep offices isolated).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the values below
```

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the project URL / anon key / service role key into `.env.local`.
3. Apply the schema: `supabase link --project-ref <ref>` then
   `supabase db push` (or paste the files under `supabase/migrations/` into
   the SQL editor in order).
4. Optionally load demo data: `psql "$DATABASE_URL" -f supabase/seed.sql`
   (or `supabase db reset`, which runs migrations + seed). This creates 3
   demo users — see the comment at the top of `seed.sql` for the password.
5. Storage buckets (`documents`, `avatars`, `brand-assets`) and their
   policies are created by the last migration.

### 2. Environment variables

See `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY` — required for the AI Assistant and all 5 agents
- `OPENAI_API_KEY` — required for Second Brain semantic search (embeddings only; all generation uses Claude)
- `NOTION_API_KEY`, `NOTION_ROOT_PAGE_ID` — optional, only for the Notion sync module
- `NEXT_PUBLIC_APP_URL` — used for auth email redirects

### 3. Run

```bash
npm run dev
```

Visit `/signup` to create the first office (this becomes the `owner`
account); invite teammates from **Settings → Equipe**.

## Notable implementation decisions

- **Why no shadcn CLI**: `ui.shadcn.com` isn't reachable from this build
  environment's network policy, so the component library under
  `src/components/ui/` was hand-written directly on the same Radix
  primitives + `class-variance-authority` + `tailwind-merge` stack the CLI
  would have generated — same API, same files, just typed by hand instead of
  fetched.
- **Type safety without a live Supabase project**: `src/types/database.types.ts`
  is hand-maintained (not `supabase gen types`, since no project is linked
  yet). Row/Insert/Update types intentionally use `type` aliases rather than
  `interface` — the Supabase JS client's generic inference requires structural
  object types to satisfy `Record<string, unknown>`, which plain interfaces
  don't. Once a project is linked, regenerate this file with
  `supabase gen types typescript --linked` for exact types.
- **Server Actions over API routes** for CRUD mutations (clients, processes,
  deadlines, hearings, tasks, templates, notes) — idiomatic Next.js 15, less
  boilerplate. Dedicated Route Handlers are used where a client component
  needs to `fetch()` (streaming AI chat, on-demand search, agent triggers,
  Notion sync, signed document URLs).
- **PDF/Excel export libraries are lazy-loaded** (`import()` inside the click
  handler) — they added ~230kB to the Reports page's first load otherwise.
- **`xlsx` (SheetJS) has an open advisory** (prototype pollution / ReDoS,
  triggered by *parsing* untrusted spreadsheets). This app only *writes*
  spreadsheets from its own trusted data (`XLSX.utils.json_to_sheet` /
  `writeFile`), never parses uploaded files, so the vulnerable code path is
  never exercised — flagged here for visibility, not silently ignored.

## Known limitations / next steps

- Financial reporting uses `case_value` (valor da causa) as a proxy for
  revenue — there's no invoicing/billing table yet.
- Document preview is a signed-URL redirect (native browser PDF viewer);
  DOCX/XLSX open via download rather than in-page rendering.
- OCR is a manual toggle (`ocr_ready` flag) — no OCR pipeline is wired up yet;
  swap in a real OCR job (e.g. on Supabase Storage upload webhook) and flip
  the flag automatically.
- WhatsApp and push notification channels are modeled in the schema and
  toggleable in Settings, but have no delivery integration yet — only
  in-app and the email toggle are live end-to-end.
- Notion sync covers processes + clients end-to-end; hearings/deadlines/tasks
  need the same `upsertPage` call wired in (see above).
- Deadline monitoring has no live Diário da Justiça / court-publication feed
  wired up (no such data source was available to integrate against) — the
  AI-extraction pipeline is real and complete, but is triggered by pasting
  publication text in rather than an automatic scrape. `/api/monitoring/ingest`
  is designed to be the same target a real scraper/webhook would call.
