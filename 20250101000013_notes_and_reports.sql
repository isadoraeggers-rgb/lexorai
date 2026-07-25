-- Freeform notes and generated reports ---------------------------------------------

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  process_id uuid references public.processes (id) on delete cascade,
  client_id uuid references public.clients (id) on delete cascade,
  hearing_id uuid references public.hearings (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  body text not null,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notes_org_idx on public.notes (organization_id);
create index notes_process_idx on public.notes (process_id);
create index notes_client_idx on public.notes (client_id);

create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

create type public.report_type as enum ('productivity', 'cases', 'financial', 'deadlines', 'hearings');

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  type public.report_type not null,
  title text not null,
  period_start date not null,
  period_end date not null,
  data jsonb not null default '{}'::jsonb,
  generated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index reports_org_idx on public.reports (organization_id, type, created_at desc);

alter table public.notes enable row level security;
alter table public.reports enable row level security;

create policy "org members can manage notes"
  on public.notes for all
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "org members can manage reports"
  on public.reports for all
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());
