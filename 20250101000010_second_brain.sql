-- Second Brain — the office's long-term AI memory ---------------------------------
-- Every decision, strategy, note, hearing outcome, AI conversation, process
-- summary, client preference and procedural history is embedded and stored here
-- so the AI assistant can semantically recall it before answering anything.

create type public.memory_type as enum (
  'decision',
  'strategy',
  'note',
  'hearing_record',
  'ai_conversation',
  'process_summary',
  'client_preference',
  'procedural_history',
  'jurisprudence',
  'doctrine'
);

create table public.second_brain_memories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  type public.memory_type not null,
  title text not null,
  content text not null,
  process_id uuid references public.processes (id) on delete set null,
  client_id uuid references public.clients (id) on delete set null,
  source text,
  metadata jsonb not null default '{}'::jsonb,
  -- text-embedding-3-small / voyage-law-2 style dimensionality; adjust if the
  -- embedding provider changes.
  embedding vector(1536),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index second_brain_org_idx on public.second_brain_memories (organization_id);
create index second_brain_type_idx on public.second_brain_memories (organization_id, type);
create index second_brain_process_idx on public.second_brain_memories (process_id);
create index second_brain_client_idx on public.second_brain_memories (client_id);
create index second_brain_embedding_idx on public.second_brain_memories
  using hnsw (embedding vector_cosine_ops);

create trigger second_brain_set_updated_at
  before update on public.second_brain_memories
  for each row execute function public.set_updated_at();

alter table public.second_brain_memories enable row level security;

create policy "org members can manage second brain memories"
  on public.second_brain_memories for all
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

-- Semantic search RPC: cosine similarity against the caller's own organization.
create or replace function public.match_second_brain_memories(
  query_embedding vector(1536),
  match_count int default 8,
  filter_type public.memory_type default null,
  filter_process_id uuid default null,
  filter_client_id uuid default null
)
returns table (
  id uuid,
  type public.memory_type,
  title text,
  content text,
  process_id uuid,
  client_id uuid,
  similarity float,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    m.id,
    m.type,
    m.title,
    m.content,
    m.process_id,
    m.client_id,
    1 - (m.embedding <=> query_embedding) as similarity,
    m.created_at
  from public.second_brain_memories m
  where m.organization_id = public.current_organization_id()
    and m.embedding is not null
    and (filter_type is null or m.type = filter_type)
    and (filter_process_id is null or m.process_id = filter_process_id)
    and (filter_client_id is null or m.client_id = filter_client_id)
  order by m.embedding <=> query_embedding
  limit match_count;
$$;
