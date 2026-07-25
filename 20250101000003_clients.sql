-- Clients ------------------------------------------------------------------------

create type public.client_type as enum ('individual', 'company');

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  type public.client_type not null default 'individual',
  name text not null,
  cpf text,
  cnpj text,
  email text,
  phone text,
  address jsonb not null default '{}'::jsonb,
  notes text,
  tags text[] not null default '{}',
  is_active boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_organization_id_idx on public.clients (organization_id);
create index clients_name_trgm_idx on public.clients using gin (name gin_trgm_ops);
create unique index clients_org_cpf_idx on public.clients (organization_id, cpf) where cpf is not null;
create unique index clients_org_cnpj_idx on public.clients (organization_id, cnpj) where cnpj is not null;

create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- Free-form timeline of client-level events (created automatically by triggers
-- elsewhere, e.g. when a linked process or document changes) plus manual notes.
create table public.client_timeline_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  event_type text not null,
  title text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index client_timeline_client_id_idx on public.client_timeline_events (client_id, created_at desc);

alter table public.clients enable row level security;
alter table public.client_timeline_events enable row level security;

create policy "org members can manage clients"
  on public.clients for all
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "org members can manage client timeline"
  on public.client_timeline_events for all
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());
