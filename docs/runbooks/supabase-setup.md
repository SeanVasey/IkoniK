# Supabase Setup Runbook

How to wire a fresh Supabase project to IkoniK and get past the most common
deployment failure (a blank **HTTP 500** on every page). Pair this with
[`deploy.md`](./deploy.md) for the Vercel side.

## TL;DR — why a freshly connected app returns 500

The edge middleware (`src/middleware.ts`) runs on every protected route and
constructs a Supabase client from `NEXT_PUBLIC_SUPABASE_URL` /
`NEXT_PUBLIC_SUPABASE_ANON_KEY`. If those are missing at **runtime**, the
Supabase SDK throws and Vercel returns a 500 before any page renders.

Two things trip people up:

1. **Variable names.** The Supabase–Vercel integration may inject
   `SUPABASE_URL` / `SUPABASE_ANON_KEY` (no prefix). IkoniK requires the
   **`NEXT_PUBLIC_`-prefixed** names — Next.js only inlines `NEXT_PUBLIC_*`
   into the browser bundle, so the non-prefixed ones won't work for the client.
2. **Redeploy required.** Env vars added *after* the last deploy don't take
   effect until you trigger a new deployment.

## 1. Environment variables (Vercel → Settings → Environment Variables)

Set all four for **Production** _and_ **Preview**:

| Variable | Where to find it (Supabase Dashboard) | Scope |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → API → Project URL | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → Project API keys → `anon` / publishable | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → Project API keys → `service_role` | **Server only — never expose** |
| `ANTHROPIC_API_KEY` | Anthropic Console | Server only |

If the integration already created `SUPABASE_URL` / `SUPABASE_ANON_KEY`, either
**add** the `NEXT_PUBLIC_`-prefixed copies or rename them. Then **redeploy**
(Deployments → ⋯ → Redeploy, or push a commit).

> Locally, copy `.env.example` to `.env.local` and fill the same four values.

## 2. Apply the database schema

The schema lives at
[`supabase/migrations/20260609000000_initial_schema.sql`](../../supabase/migrations).
It creates the `profiles`, `uploads`, and `usage_log` tables, RLS policies, the
private `uploads` storage bucket, and the signup trigger.

**Option A — Supabase CLI (preferred):**

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

**Option B — Dashboard:** open SQL Editor, paste the migration file, and Run.
It's re-runnable, so applying it twice is safe.

## 3. Configure sign-in methods

IkoniK supports three sign-in methods: **GitHub** OAuth, **Google** OAuth, and
passwordless **email magic links**. Email is enabled by default in Supabase and
needs no setup; the two OAuth providers each require a client ID/secret.

First, under **Authentication → URL Configuration** set:

- **Site URL:** `https://<your-app>.vercel.app`
- **Redirect URLs:** add `https://<your-app>.vercel.app/auth/callback`
  (and `http://localhost:3000/auth/callback` for local dev).

Then, for each OAuth provider, it's a two-way handshake — register Supabase's
callback URL in the provider console, then paste the provider's credentials back
into Supabase. **Supabase callback URL** (the same for both):

```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

**GitHub** — GitHub → *Settings → Developer settings → OAuth Apps → New OAuth App*:
set **Homepage URL** to your app URL and **Authorization callback URL** to the
Supabase callback above. Copy the Client ID + generated secret into **Supabase →
Authentication → Providers → GitHub** and Save.

**Google** — *Google Cloud Console → APIs & Services → Credentials → OAuth client
ID* (Web application). Add the Supabase callback above to **Authorized redirect
URIs**. Copy the Client ID + secret into **Supabase → Authentication → Providers
→ Google** and Save.

A provider stays inactive until **both** its ID and secret are saved. OAuth
secrets live in Supabase, **not** Vercel.

## 4. Approve yourself + grant admin

Every new user starts `status = 'pending'` and is redirected to `/pending`.
After your first sign-in, promote your own account in the SQL Editor:

```sql
update public.profiles
set status = 'approved', role = 'admin'
where email = 'you@example.com';
```

You can now reach `/convert` and the `/admin` approval panel.

## 5. Verify

1. Hit the production URL — it should redirect to `/auth` (not 500).
2. Sign in; first time lands on `/pending` until approved.
3. After the SQL above, you reach `/convert` and can run a conversion.
4. Check **Supabase → Logs** and **Vercel → Runtime Logs** if anything 500s —
   a "supabaseUrl is required" / "Missing … environment variables" message
   confirms a still-missing env var from step 1.
