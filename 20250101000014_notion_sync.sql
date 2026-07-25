-- Notion bi-directional sync links --------------------------------------------------
-- Every process/client/hearing/deadline/task keeps a pointer to its mirrored
-- Notion page (and vice-versa) so the sync worker can diff and push updates in
-- both directions without duplicating pages.

create type public.notion_entity_type as enum (
  'process', 'client', 'hearing', 'deadline', 'task', 'wiki_page'
);

create table public.notion_sync_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  entity_type public.notion_entity_type not null,
  entity_id uuid,
  notion_page_id text not null,
  notion_database_id text,
  last_synced_at timestamptz,
  last_synced_hash text,
  sync_direction text not null default 'bidirectional',
  created_at timestamptz not null default now(),
  unique (organization_id, entity_type, entity_id)
);

create index notion_sync_links_org_idx on public.notion_sync_links (organization_id);
create index notion_sync_links_page_idx on public.notion_sync_links (notion_page_id);

-- Per-organization Notion workspace credentials & database map (office wiki,
-- prompt library, jurisprudence, doctrine, policies, meeting notes...).
create table public.notion_workspaces (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  access_token_encrypted text,
  workspace_name text,
  database_map jsonb not null default '{}'::jsonb,
  last_full_sync_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notion_sync_links enable row level security;
alter table public.notion_workspaces enable row level security;

create policy "org members can manage notion sync links"
  on public.notion_sync_links for all
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "org admins can manage notion workspace config"
  on public.notion_workspaces for all
  using (organization_id = public.current_organization_id() and public.is_org_admin())
  with check (organization_id = public.current_organization_id() and public.is_org_admin());
