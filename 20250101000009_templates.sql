-- Office templates (used by lawyers and by the AI assistant) --------------------

create type public.template_category as enum (
  'petition', 'appeal', 'contract', 'notification', 'email', 'checklist', 'report'
);

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  category public.template_category not null,
  description text,
  content text not null,
  variables jsonb not null default '[]'::jsonb,
  usage_count integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index templates_org_idx on public.templates (organization_id);
create index templates_category_idx on public.templates (organization_id, category);

create trigger templates_set_updated_at
  before update on public.templates
  for each row execute function public.set_updated_at();

alter table public.templates enable row level security;

create policy "org members can manage templates"
  on public.templates for all
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());
