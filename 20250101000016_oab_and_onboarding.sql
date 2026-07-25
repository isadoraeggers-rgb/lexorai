-- OAB registrations, mandatory onboarding and deadline-monitoring gating ------------
-- Every office must complete a first-time setup wizard (office info, lawyer's own
-- OAB registration, and which OAB registrations to monitor) before using the rest
-- of the app. Automatic deadline monitoring stays disabled until at least one
-- active OAB registration is flagged `is_monitored`.

alter table public.organizations
  add column phone text,
  add column email text,
  add column onboarding_completed_at timestamptz;

create table public.oab_registrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete cascade,
  oab_number text not null,
  oab_state text not null check (char_length(oab_state) = 2),
  practice_areas text[] not null default '{}',
  is_active boolean not null default true,
  is_monitored boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, oab_state, oab_number)
);

create index oab_registrations_org_idx on public.oab_registrations (organization_id);
create index oab_registrations_profile_idx on public.oab_registrations (profile_id);
create index oab_registrations_monitored_idx on public.oab_registrations (organization_id) where is_monitored = true;

create trigger oab_registrations_set_updated_at
  before update on public.oab_registrations
  for each row execute function public.set_updated_at();

alter table public.oab_registrations enable row level security;

create policy "org members can manage oab registrations"
  on public.oab_registrations for all
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

-- Publications detected from Diário da Justiça / procedural monitoring for a
-- monitored OAB registration. `status` tracks the AI-extraction pipeline;
-- `detected_deadline_id` links to the deadline it auto-created, if any.
create type public.publication_status as enum ('pending', 'processed', 'dismissed');

create table public.monitored_publications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  oab_registration_id uuid references public.oab_registrations (id) on delete cascade,
  process_number text,
  court text,
  publication_date date,
  raw_text text not null,
  status public.publication_status not null default 'pending',
  detected_deadline_id uuid references public.deadlines (id) on delete set null,
  created_at timestamptz not null default now()
);

create index monitored_publications_org_idx on public.monitored_publications (organization_id, created_at desc);
create index monitored_publications_oab_idx on public.monitored_publications (oab_registration_id);

alter table public.monitored_publications enable row level security;

create policy "org members can manage monitored publications"
  on public.monitored_publications for all
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

-- Distinguishes deadlines created by hand from ones auto-created by the
-- monitoring pipeline, so the UI can flag "detectado automaticamente".
create type public.deadline_origin as enum ('manual', 'auto_monitoring');

alter table public.deadlines
  add column origin public.deadline_origin not null default 'manual',
  add column source_publication_id uuid references public.monitored_publications (id) on delete set null;

-- Convenience view: whether the org has at least one active + monitored OAB.
-- The Deadline Monitoring module gates on this instead of re-querying inline.
create or replace view public.deadline_monitoring_status
with (security_invoker = true)
as
select
  o.id as organization_id,
  exists (
    select 1 from public.oab_registrations r
    where r.organization_id = o.id and r.is_active = true and r.is_monitored = true
  ) as monitoring_enabled
from public.organizations o;
