-- Notifications and audit log ------------------------------------------------------

create type public.notification_channel as enum ('in_app', 'email', 'whatsapp', 'push');
create type public.notification_type as enum (
  'deadline_due', 'hearing_reminder', 'task_assigned', 'document_uploaded',
  'process_updated', 'ai_summary_ready', 'mention', 'system'
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null default 'system',
  channel public.notification_channel not null default 'in_app',
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, is_read, created_at desc);
create index notifications_org_idx on public.notifications (organization_id);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_logs_org_idx on public.activity_logs (organization_id, created_at desc);
create index activity_logs_entity_idx on public.activity_logs (entity_type, entity_id);

alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

create policy "users can read and update their own notifications"
  on public.notifications for select
  using (organization_id = public.current_organization_id() and user_id = auth.uid());

create policy "users can mark their own notifications read"
  on public.notifications for update
  using (user_id = auth.uid());

create policy "org members can insert notifications"
  on public.notifications for insert
  with check (organization_id = public.current_organization_id());

create policy "org members can read activity logs"
  on public.activity_logs for select
  using (organization_id = public.current_organization_id());

create policy "org members can insert activity logs"
  on public.activity_logs for insert
  with check (organization_id = public.current_organization_id());
