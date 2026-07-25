-- Organizations (law offices) and user profiles ---------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  brand_color text not null default '#2563EB',
  oab_registration text,
  address jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create type public.user_role as enum ('owner', 'admin', 'lawyer', 'paralegal', 'financial', 'viewer');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete cascade,
  full_name text not null,
  email text not null,
  avatar_url text,
  role public.user_role not null default 'lawyer',
  oab_number text,
  phone text,
  title text,
  is_active boolean not null default true,
  pinned_process_ids uuid[] not null default '{}',
  favorite_client_ids uuid[] not null default '{}',
  notification_prefs jsonb not null default '{"email": true, "push": true, "whatsapp": false, "in_app": true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_organization_id_idx on public.profiles (organization_id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Helper functions used by every RLS policy in later migrations ------------------

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_org_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role in ('owner', 'admin') from public.profiles where id = auth.uid()), false);
$$;

-- Bootstraps a profile the moment a user signs up via Supabase Auth. If the
-- signup carries an `invited_organization_id` (set by the team-invite flow,
-- see lib/actions/team.ts) the user joins that organization instead of
-- getting a brand-new one, so office invites don't spin up duplicate orgs.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  org_name text;
  org_slug text;
  invited_org_id uuid;
  invited_role public.user_role;
begin
  invited_org_id := nullif(new.raw_user_meta_data ->> 'invited_organization_id', '')::uuid;

  if invited_org_id is not null then
    invited_role := coalesce((new.raw_user_meta_data ->> 'invited_role')::public.user_role, 'lawyer');

    insert into public.profiles (id, organization_id, full_name, email, role)
    values (
      new.id,
      invited_org_id,
      coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
      new.email,
      invited_role
    );

    return new;
  end if;

  org_name := coalesce(new.raw_user_meta_data ->> 'organization_name', 'Meu Escritório');
  org_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(new.id::text, 1, 8);

  insert into public.organizations (name, slug)
  values (org_name, org_slug)
  returning id into new_org_id;

  insert into public.profiles (id, organization_id, full_name, email, role)
  values (
    new.id,
    new_org_id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    'owner'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;

create policy "org members can read their organization"
  on public.organizations for select
  using (id = public.current_organization_id());

create policy "org admins can update their organization"
  on public.organizations for update
  using (id = public.current_organization_id() and public.is_org_admin());

create policy "org members can read profiles in their organization"
  on public.profiles for select
  using (organization_id = public.current_organization_id());

create policy "users can update their own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "admins can update any profile in their organization"
  on public.profiles for update
  using (organization_id = public.current_organization_id() and public.is_org_admin());

create policy "admins can invite profiles into their organization"
  on public.profiles for insert
  with check (organization_id = public.current_organization_id() and public.is_org_admin());
