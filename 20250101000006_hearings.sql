-- Hearings -------------------------------------------------------------------------

create type public.hearing_location_type as enum ('in_person', 'online', 'hybrid');
create type public.hearing_status as enum ('scheduled', 'completed', 'cancelled', 'rescheduled');

create table public.hearings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  process_id uuid references public.processes (id) on delete cascade,
  title text not null,
  hearing_type text,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60,
  location_type public.hearing_location_type not null default 'in_person',
  address text,
  meet_url text,
  judge text,
  status public.hearing_status not null default 'scheduled',
  notes text,
  ai_prep_notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index hearings_organization_id_idx on public.hearings (organization_id);
create index hearings_process_id_idx on public.hearings (process_id);
create index hearings_scheduled_at_idx on public.hearings (organization_id, scheduled_at);

create trigger hearings_set_updated_at
  before update on public.hearings
  for each row execute function public.set_updated_at();

create table public.hearing_participants (
  id uuid primary key default gen_random_uuid(),
  hearing_id uuid not null references public.hearings (id) on delete cascade,
  name text not null,
  role text,
  email text,
  confirmed boolean not null default false
);

create index hearing_participants_hearing_id_idx on public.hearing_participants (hearing_id);

create table public.hearing_checklist_items (
  id uuid primary key default gen_random_uuid(),
  hearing_id uuid not null references public.hearings (id) on delete cascade,
  title text not null,
  is_done boolean not null default false,
  order_index integer not null default 0
);

create index hearing_checklist_hearing_id_idx on public.hearing_checklist_items (hearing_id);

create table public.hearing_attachments (
  id uuid primary key default gen_random_uuid(),
  hearing_id uuid not null references public.hearings (id) on delete cascade,
  document_id uuid,
  file_name text not null,
  file_path text not null,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.hearings enable row level security;
alter table public.hearing_participants enable row level security;
alter table public.hearing_checklist_items enable row level security;
alter table public.hearing_attachments enable row level security;

create policy "org members can manage hearings"
  on public.hearings for all
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "org members can manage hearing participants"
  on public.hearing_participants for all
  using (exists (select 1 from public.hearings h where h.id = hearing_id and h.organization_id = public.current_organization_id()))
  with check (exists (select 1 from public.hearings h where h.id = hearing_id and h.organization_id = public.current_organization_id()));

create policy "org members can manage hearing checklist"
  on public.hearing_checklist_items for all
  using (exists (select 1 from public.hearings h where h.id = hearing_id and h.organization_id = public.current_organization_id()))
  with check (exists (select 1 from public.hearings h where h.id = hearing_id and h.organization_id = public.current_organization_id()));

create policy "org members can manage hearing attachments"
  on public.hearing_attachments for all
  using (exists (select 1 from public.hearings h where h.id = hearing_id and h.organization_id = public.current_organization_id()))
  with check (exists (select 1 from public.hearings h where h.id = hearing_id and h.organization_id = public.current_organization_id()));
