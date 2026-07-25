-- Deadlines ------------------------------------------------------------------------

create type public.deadline_status as enum ('upcoming', 'completed', 'late');
create type public.reminder_frequency as enum ('none', 'daily', 'weekly', 'monthly');

create table public.deadlines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  process_id uuid references public.processes (id) on delete cascade,
  title text not null,
  description text,
  due_date timestamptz not null,
  status public.deadline_status not null default 'upcoming',
  priority public.priority_level not null default 'medium',
  reminder_frequency public.reminder_frequency not null default 'weekly',
  responsible_user_id uuid references public.profiles (id) on delete set null,
  completed_at timestamptz,
  completed_by uuid references public.profiles (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deadlines_organization_id_idx on public.deadlines (organization_id);
create index deadlines_process_id_idx on public.deadlines (process_id);
create index deadlines_due_date_idx on public.deadlines (organization_id, due_date);
create index deadlines_status_idx on public.deadlines (organization_id, status);

create trigger deadlines_set_updated_at
  before update on public.deadlines
  for each row execute function public.set_updated_at();

-- Keeps status in sync with due_date/completion so kanban + calendar views never drift.
create or replace function public.recompute_deadline_status()
returns trigger
language plpgsql
as $$
begin
  if new.completed_at is not null then
    new.status := 'completed';
  elsif new.due_date < now() then
    new.status := 'late';
  else
    new.status := 'upcoming';
  end if;
  return new;
end;
$$;

create trigger deadlines_recompute_status
  before insert or update of due_date, completed_at on public.deadlines
  for each row execute function public.recompute_deadline_status();

alter table public.deadlines enable row level security;

create policy "org members can manage deadlines"
  on public.deadlines for all
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());
