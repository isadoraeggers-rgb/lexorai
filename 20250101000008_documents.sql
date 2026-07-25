-- Documents, folders, tags and versioning ---------------------------------------

create table public.document_folders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  parent_id uuid references public.document_folders (id) on delete cascade,
  process_id uuid references public.processes (id) on delete cascade,
  client_id uuid references public.clients (id) on delete cascade,
  name text not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index document_folders_org_idx on public.document_folders (organization_id);
create index document_folders_parent_idx on public.document_folders (parent_id);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  color text not null default '#2563EB',
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create type public.document_file_type as enum ('pdf', 'docx', 'xlsx', 'image', 'other');

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  folder_id uuid references public.document_folders (id) on delete set null,
  process_id uuid references public.processes (id) on delete cascade,
  client_id uuid references public.clients (id) on delete cascade,
  name text not null,
  file_path text not null,
  file_type public.document_file_type not null default 'other',
  mime_type text,
  size_bytes bigint not null default 0,
  ocr_ready boolean not null default false,
  ocr_text text,
  current_version integer not null default 1,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index documents_org_idx on public.documents (organization_id);
create index documents_process_idx on public.documents (process_id);
create index documents_client_idx on public.documents (client_id);
create index documents_folder_idx on public.documents (folder_id);
create index documents_name_trgm_idx on public.documents using gin (name gin_trgm_ops);

create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  version_number integer not null,
  file_path text not null,
  size_bytes bigint not null default 0,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index document_versions_document_idx on public.document_versions (document_id, version_number desc);

create table public.document_tag_links (
  document_id uuid not null references public.documents (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (document_id, tag_id)
);

alter table public.document_folders enable row level security;
alter table public.tags enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.document_tag_links enable row level security;

create policy "org members can manage document folders"
  on public.document_folders for all
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "org members can manage tags"
  on public.tags for all
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "org members can manage documents"
  on public.documents for all
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "org members can manage document versions"
  on public.document_versions for all
  using (exists (select 1 from public.documents d where d.id = document_id and d.organization_id = public.current_organization_id()))
  with check (exists (select 1 from public.documents d where d.id = document_id and d.organization_id = public.current_organization_id()));

create policy "org members can manage document tag links"
  on public.document_tag_links for all
  using (exists (select 1 from public.documents d where d.id = document_id and d.organization_id = public.current_organization_id()))
  with check (exists (select 1 from public.documents d where d.id = document_id and d.organization_id = public.current_organization_id()));
