# Supabase

Database schema and configuration for IkoniK. This is the **source of truth**
for the IkoniK Postgres database — do not make ad-hoc schema changes in the
Dashboard without mirroring them into a migration here.

## Layout

```
supabase/
└── migrations/
    └── 20260609000000_initial_schema.sql   # profiles, uploads, usage_log,
                                             # RLS, storage bucket, signup trigger
```

## Applying migrations

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Or paste a migration into the Dashboard → SQL Editor. Migrations are written to
be re-runnable (idempotent guards throughout), so re-applying is safe.

## What the schema provides

- **`profiles`** — one row per auth user; `status` (pending/approved/suspended)
  gates app access, `role` (user/admin) gates the admin panel. A signup trigger
  auto-creates the row from OAuth metadata.
- **`uploads`** — validated-file metadata, written server-side after magic-byte
  + checksum checks.
- **`usage_log`** — append-only audit of API calls for cost monitoring.
- **RLS** — users see only their own rows; admins see all; only admins can
  change approval status. Writes to `uploads`/`usage_log` are service-role only.
- **Storage** — private `uploads` bucket locked to per-user `users/{uid}/…`
  folders.

Full setup walkthrough (env vars, OAuth, first-admin bootstrap):
[`docs/runbooks/supabase-setup.md`](../docs/runbooks/supabase-setup.md).
