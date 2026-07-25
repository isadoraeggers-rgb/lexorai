-- Processes (legal cases) ---------------------------------------------------------

create type public.process_status as enum (
  'active', 'suspended', 'archived', 'won', 'lost', 'settled'
);
create type public.risk_level as enum ('low', 'medium', 'high', 'critical');
create type public.priority_level as enum ('low', 'medium', 'high', 'urgent');

create table public.processes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  number text not null,
  court text,
  judge text,
  class text,
  subject text,
  opposing_party text,
  lawyer_id uuid references public.profiles (id) on delete set null,
  responsible_user_id uuid references public.profiles (id) on delete set null,
  status public.process_status not null default 'active',
  risk_level public.risk_level not null default 'medium',
  priority public.priority_level not null default 'medium',
  case_value numeric(14, 2),
  ai_summary text,
  ai_summary_updated_at timestamptz,
  distribution_date date,
  last_movement_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index processes_organization_id_idx on public.processes (organization_id);
create unique index processes_org_number_idx on public.processes (organization_id, number);
create index processes_status_idx on public.processes (organization_id, status);
create index processes_number_trgm_idx on public.processes using gin (number gin_trgm_ops);

create trigger processes_set_updated_at
  before update on public.processes
  for each row execute function public.set_updated_at();

-- Many-to-many: a process can involve multiple clients (e.g. co-plaintiffs) and
-- a client can be tied to many processes.
create type public.process_party_role as enum ('client', 'co_party', 'third_party');

create table public.process_clients (
  process_id uuid not null references public.processes (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  role public.process_party_role not null default 'client',
  primary key (process_id, client_id)
);

create index process_clients_client_id_idx on public.process_clients (client_id);

create table public.process_timeline_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  process_id uuid not null references public.processes (id) on delete cascade,
  event_type text not null,
  title text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index process_timeline_process_id_idx on public.process_timeline_events (process_id, created_at desc);

alter table public.processes enable row level security;
alter table public.process_clients enable row level security;
alter table public.process_timeline_events enable row level security;

create policy "org members can manage processes"
  on public.processes for all
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "org members can manage process_clients"
  on public.process_clients for all
  using (exists (
    select 1 from public.processes p
    where p.id = process_id and p.organization_id = public.current_organization_id()
  ))
  with check (exists (
    select 1 from public.processes p
    where p.id = process_id and p.organization_id = public.current_organization_id()
  ));

create policy "org members can manage process timeline"
  on public.process_timeline_events for all
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());
