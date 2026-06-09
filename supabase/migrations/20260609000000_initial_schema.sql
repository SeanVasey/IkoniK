-- IkoniK — initial schema
-- =============================================================================
-- Source of truth for the IkoniK database. Defines the three application tables
-- (profiles, uploads, usage_log), Row-Level Security policies, the private
-- `uploads` storage bucket, and the trigger that provisions a profile row when
-- a new user signs up via Supabase Auth.
--
-- Apply with the Supabase CLI:   supabase db push
-- ...or paste into the Supabase Dashboard → SQL Editor and run once.
--
-- Re-runnable: every object is created with IF NOT EXISTS / OR REPLACE / guards,
-- so applying this file twice is a no-op rather than an error.
-- =============================================================================

-- ── Tables ───────────────────────────────────────────────────────────────────
-- profiles: one row per authenticated user. `status` gates access (the
-- middleware and API routes check it); `role` gates the admin panel. New users
-- land as ('pending','user') and must be approved by an admin.
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null default '',
  display_name  text not null default '',
  avatar_url    text not null default '',
  provider      text not null default '',
  status        text not null default 'pending'
                  check (status in ('pending', 'approved', 'suspended')),
  role          text not null default 'user'
                  check (role in ('user', 'admin')),
  created_at    timestamptz not null default now(),
  last_sign_in  timestamptz
);

-- uploads: metadata for each validated file in the `uploads` storage bucket.
-- Written by the server (service-role) after magic-byte + checksum validation.
create table if not exists public.uploads (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  object_path  text not null unique,
  filename     text not null,
  mime_type    text not null,
  size_bytes   bigint not null,
  sha256       text not null,
  created_at   timestamptz not null default now()
);

create index if not exists uploads_user_id_idx on public.uploads (user_id);

-- usage_log: append-only audit of API calls for cost monitoring.
create table if not exists public.usage_log (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  endpoint       text not null,
  model          text,
  input_tokens   integer,
  output_tokens  integer,
  created_at     timestamptz not null default now()
);

create index if not exists usage_log_user_id_idx on public.usage_log (user_id);
create index if not exists usage_log_created_at_idx on public.usage_log (created_at);

-- ── Helper functions live in a PRIVATE (non-API-exposed) schema ──────────────
-- PostgREST only exposes `public`, so placing SECURITY DEFINER helpers here
-- keeps them off the /rest/v1/rpc/* surface while RLS and triggers can still
-- call them. (Defined after the tables they reference so a one-pass apply on a
-- fresh database succeeds.)
create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

-- is_admin: SECURITY DEFINER so admin RLS policies don't recurse back through
-- the profiles RLS policies. RLS evaluation runs as the querying role, which
-- needs EXECUTE — this is safe because `private` is not an exposed schema.
create or replace function private.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'admin'
  );
$$;

grant execute on function private.is_admin(uuid) to anon, authenticated;

-- ── Row-Level Security ───────────────────────────────────────────────────────
alter table public.profiles  enable row level security;
alter table public.uploads   enable row level security;
alter table public.usage_log enable row level security;

-- profiles: read your own row; admins read all. Only admins may change
-- status/role (no self-approval). Inserts happen via the signup trigger below,
-- which runs with definer privileges and bypasses these policies.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or private.is_admin(auth.uid()));

drop policy if exists "profiles_update_admin_only" on public.profiles;
create policy "profiles_update_admin_only"
  on public.profiles for update
  using (private.is_admin(auth.uid()))
  with check (private.is_admin(auth.uid()));

-- uploads / usage_log: read your own rows; admins read all. Writes are
-- service-role only (which bypasses RLS), so there are no insert policies.
drop policy if exists "uploads_select_own_or_admin" on public.uploads;
create policy "uploads_select_own_or_admin"
  on public.uploads for select
  using (auth.uid() = user_id or private.is_admin(auth.uid()));

drop policy if exists "usage_log_select_own_or_admin" on public.usage_log;
create policy "usage_log_select_own_or_admin"
  on public.usage_log for select
  using (auth.uid() = user_id or private.is_admin(auth.uid()));

-- ── Signup trigger: provision a profile row for every new auth user ──────────
-- Pulls display name / avatar / provider from the OAuth metadata Supabase
-- stores on auth.users. SECURITY DEFINER so it can insert past the locked-down
-- profiles RLS. Lives in `private` to stay off the RPC surface.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url, provider)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture',
      ''
    ),
    coalesce(new.raw_app_meta_data ->> 'provider', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ── Storage: private `uploads` bucket, locked to per-user folders ────────────
-- Path convention enforced by the app: users/{userId}/{uuid}-{filename}.
-- The bucket is private; the app reads/writes via the service-role key and
-- mints short-lived signed URLs for large direct uploads. These policies are
-- defense-in-depth for any client that holds only the anon key.
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do nothing;

drop policy if exists "uploads_storage_select_own" on storage.objects;
create policy "uploads_storage_select_own"
  on storage.objects for select
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "uploads_storage_insert_own" on storage.objects;
create policy "uploads_storage_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "uploads_storage_delete_own" on storage.objects;
create policy "uploads_storage_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
