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

-- ── Helper: admin check (SECURITY DEFINER avoids RLS recursion) ──────────────
-- Reads profiles.role with definer privileges so admin RLS policies don't
-- recurse back through the profiles RLS policies that call this function.
create or replace function public.is_admin(uid uuid)
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

-- ── Table: profiles ──────────────────────────────────────────────────────────
-- One row per authenticated user. `status` gates access (the middleware and the
-- API routes check it); `role` gates the admin panel. New users land as
-- ('pending','user') and must be approved by an admin.
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

-- ── Table: uploads ───────────────────────────────────────────────────────────
-- Metadata for each validated file in the `uploads` storage bucket. Written by
-- the server (service-role) after magic-byte + checksum validation passes.
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

-- ── Table: usage_log ─────────────────────────────────────────────────────────
-- Append-only audit of API calls (uploads + Claude usage) for cost monitoring.
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

-- ── Row-Level Security ───────────────────────────────────────────────────────
alter table public.profiles  enable row level security;
alter table public.uploads   enable row level security;
alter table public.usage_log enable row level security;

-- profiles: a user can read their own row; admins can read every row.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin(auth.uid()));

-- profiles: only admins may change status/role (approval workflow). A user
-- cannot self-approve. Profile creation happens via the signup trigger below,
-- which runs with definer privileges and bypasses this policy.
drop policy if exists "profiles_update_admin_only" on public.profiles;
create policy "profiles_update_admin_only"
  on public.profiles for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- uploads: a user can read their own metadata; admins can read all. Writes go
-- through the service-role key (which bypasses RLS), so no insert policy here.
drop policy if exists "uploads_select_own_or_admin" on public.uploads;
create policy "uploads_select_own_or_admin"
  on public.uploads for select
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- usage_log: same read model. Writes are service-role only.
drop policy if exists "usage_log_select_own_or_admin" on public.usage_log;
create policy "usage_log_select_own_or_admin"
  on public.usage_log for select
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- ── Signup trigger: provision a profile row for every new auth user ──────────
-- Pulls display name / avatar / provider out of the OAuth metadata Supabase
-- stores on the auth.users row. Runs as SECURITY DEFINER so it can insert into
-- public.profiles regardless of the (locked-down) RLS policies above.
create or replace function public.handle_new_user()
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
  for each row execute function public.handle_new_user();

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
