-- Tasks (Kanban) ---------------------------------------------------------------

create type public.task_status as enum ('todo', 'doing', 'waiting', 'done');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  process_id uuid references public.processes (id) on delete set null,
  client_id uuid references public.clients (id) on delete set null,
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  priority public.priority_level not null default 'medium',
  due_date timestamptz,
  assigned_to uuid references public.profiles (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_organization_id_idx on public.tasks (organization_id);
create index tasks_status_idx on public.tasks (organization_id, status, order_index);
create index tasks_assigned_to_idx on public.tasks (assigned_to);
create index tasks_process_id_idx on public.tasks (process_id);

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index task_comments_task_id_idx on public.task_comments (task_id, created_at);

alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;

create policy "org members can manage tasks"
  on public.tasks for all
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "org members can manage task comments"
  on public.task_comments for all
  using (exists (select 1 from public.tasks t where t.id = task_id and t.organization_id = public.current_organization_id()))
  with check (exists (select 1 from public.tasks t where t.id = task_id and t.organization_id = public.current_organization_id()));
