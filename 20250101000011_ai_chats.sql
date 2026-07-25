-- AI Assistant chats + the five Claude Code Agents ---------------------------------

create type public.ai_agent_type as enum (
  'assistant',
  'controladoria',
  'petition_writer',
  'case_analyst',
  'document_reviewer',
  'office_manager'
);

create table public.ai_chats (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete cascade,
  agent_type public.ai_agent_type not null default 'assistant',
  title text not null default 'Nova conversa',
  process_id uuid references public.processes (id) on delete set null,
  client_id uuid references public.clients (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ai_chats_org_idx on public.ai_chats (organization_id);
create index ai_chats_user_idx on public.ai_chats (user_id, updated_at desc);

create trigger ai_chats_set_updated_at
  before update on public.ai_chats
  for each row execute function public.set_updated_at();

create type public.ai_message_role as enum ('user', 'assistant', 'system');

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.ai_chats (id) on delete cascade,
  role public.ai_message_role not null,
  content text not null,
  tool_calls jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index ai_messages_chat_idx on public.ai_messages (chat_id, created_at);

-- Weekly/monthly digests and one-off findings surfaced by the autonomous agents
-- (Controladoria Jurídica, Office Manager, ...) that aren't tied to a live chat.
create table public.ai_agent_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  agent_type public.ai_agent_type not null,
  summary text not null,
  details jsonb not null default '{}'::jsonb,
  process_id uuid references public.processes (id) on delete set null,
  created_at timestamptz not null default now()
);

create index ai_agent_runs_org_idx on public.ai_agent_runs (organization_id, created_at desc);

alter table public.ai_chats enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_agent_runs enable row level security;

create policy "org members can manage their ai chats"
  on public.ai_chats for all
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "org members can manage ai messages"
  on public.ai_messages for all
  using (exists (select 1 from public.ai_chats c where c.id = chat_id and c.organization_id = public.current_organization_id()))
  with check (exists (select 1 from public.ai_chats c where c.id = chat_id and c.organization_id = public.current_organization_id()));

create policy "org members can read ai agent runs"
  on public.ai_agent_runs for all
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());
