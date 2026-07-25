-- Supabase Storage buckets ----------------------------------------------------------

insert into storage.buckets (id, name, public)
values
  ('documents', 'documents', false),
  ('avatars', 'avatars', true),
  ('brand-assets', 'brand-assets', true)
on conflict (id) do nothing;

-- Documents bucket: private, path convention "{organization_id}/{...}" enforced
-- by policy so RLS on the bucket mirrors RLS on the `documents` table.
create policy "org members can read their documents"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.current_organization_id()::text
  );

create policy "org members can upload their documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.current_organization_id()::text
  );

create policy "org members can update their documents"
  on storage.objects for update
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.current_organization_id()::text
  );

create policy "org members can delete their documents"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.current_organization_id()::text
  );

create policy "anyone can read public avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "org members can manage their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "org members can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "anyone can read brand assets"
  on storage.objects for select
  using (bucket_id = 'brand-assets');

create policy "org admins can manage brand assets"
  on storage.objects for insert
  with check (
    bucket_id = 'brand-assets'
    and (storage.foldername(name))[1] = public.current_organization_id()::text
    and public.is_org_admin()
  );

-- Control Center summary view --------------------------------------------------------
-- One round-trip for the legal-operations overview: processes without movement,
-- late deadlines, hearings this week, overdue tasks, clients waiting, etc.
create or replace view public.control_center_snapshot
with (security_invoker = true)
as
select
  o.id as organization_id,
  (select count(*) from public.processes p
    where p.organization_id = o.id and p.status = 'active'
      and (p.last_movement_at is null or p.last_movement_at < now() - interval '30 days')
  ) as processes_without_movement,
  (select count(*) from public.deadlines d
    where d.organization_id = o.id and d.status = 'late'
  ) as late_deadlines,
  (select count(*) from public.hearings h
    where h.organization_id = o.id and h.status = 'scheduled'
      and h.scheduled_at between now() and now() + interval '7 days'
  ) as hearings_this_week,
  (select count(*) from public.tasks t
    where t.organization_id = o.id and t.status <> 'done'
      and t.due_date is not null and t.due_date < now()
  ) as tasks_overdue,
  (select count(*) from public.documents doc
    where doc.organization_id = o.id and doc.ocr_ready = false
  ) as documents_missing_ocr,
  (select count(*) from public.clients c
    where c.organization_id = o.id and c.is_active = true
  ) as active_clients
from public.organizations o;

comment on view public.control_center_snapshot is
  'Aggregated legal-operations counters for the Control Center module. Scoped per-organization via security_invoker + underlying table RLS.';
