-- Lexora — Legal Operating System
-- Extensions and shared helper functions used across every module.

create extension if not exists "pgcrypto";
create extension if not exists "vector";
create extension if not exists "pg_trgm";

-- Generic updated_at maintenance -------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Auth/session helpers -----------------------------------------------------------
-- profiles.id === auth.uid(); every tenant-scoped table carries organization_id
-- and RLS policies compare it against the caller's own organization via these
-- SECURITY DEFINER helpers (defined after the profiles table exists, see
-- 20250101000002_organizations_and_profiles.sql).

create schema if not exists lexora;
