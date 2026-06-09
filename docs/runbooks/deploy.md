# Deploy Runbook

## Pre-deploy Checklist

- [ ] CI pipeline is green on the target branch
- [ ] No unresolved `TODO` / `FIXME` in deployed files
- [ ] Clean lockfile install (`npm ci`) succeeds locally
- [ ] Zero build errors (`npm run build`)
- [ ] Environment variables are set in Vercel project settings (see Required env vars)
- [ ] If touching auth / RLS / upload pipeline: `/security-review` has run and findings addressed
- [ ] If bumping a Claude model: ADR added in `docs/decisions/`, `bump-claude-model` skill walkthrough completed

## Deployment

IkoniK deploys to **Vercel** with the following configuration (`vercel.json` and project settings):

- **Region:** `iad1` (US East — Washington, D.C.)
- **Build command:** `next build` (auto-detected)
- **Output directory:** `.next` (auto-detected)
- **Install command:** `npm ci`
- **Framework preset:** Next.js

### Preview deploys

Every pull request gets an automatic preview deploy. URL is posted as a check on the PR. Preview deploys use **the same env vars as production** by default — if you need a separate Supabase project or rotated keys for previews, configure them in Vercel under *Settings → Environment Variables → Preview*.

### Production deploys

Merges to `main` trigger a production deploy automatically. There is no manual promote step.

### Required env vars (Vercel project settings)

| Variable | Scope | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | Server only | Capped in code via `ALLOWED_MODELS`; **also cap in the Anthropic Console dashboard** for defense in depth |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Inlined into the client bundle |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | RLS enforces row-level security; this key is safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | **Bypasses RLS** — never expose to the client |

OAuth provider secrets (GitHub, Google) are configured in the Supabase Dashboard, not in Vercel. Email magic-link sign-in needs no provider secrets.

> **First-time setup / blank 500 on every page?** The most common cause is the
> Supabase–Vercel integration injecting `SUPABASE_URL` / `SUPABASE_ANON_KEY`
> instead of the `NEXT_PUBLIC_`-prefixed names this app requires — and env vars
> added after the last deploy need a redeploy to take effect. Full walkthrough
> (env vars, schema migration, OAuth, first-admin bootstrap):
> [`supabase-setup.md`](./supabase-setup.md).

### Build-time considerations

`npm run build` requires the public env vars (`NEXT_PUBLIC_*`) to be present at build time — Next.js inlines them into static pages. The server-only vars (`ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are read at runtime and **must be present in the Vercel runtime environment**, but the build itself will succeed without them.

## Rollback

1. **Identify the last known good deployment** in Vercel → *Deployments*.
2. **Promote it via the Vercel UI:** open the previous deploy → *Promote to Production*. This re-aliases the production domain to that deployment without rebuilding.
3. **Verify** the rolled-back version is serving by hitting the production URL and checking the deploy hash in the response headers (`x-vercel-id` includes the deploy SHA).
4. **Investigate the regression on a branch:**
   - Reproduce locally (`npm run dev` against production env vars *only if safe*; otherwise mock).
   - Run the full verify gate: `npm run lint && npm run typecheck && npm test && npm run build`.
   - If the regression is data-related, check Supabase logs and recent RLS policy changes.
5. **Re-deploy the fix** through the normal PR → preview → main flow.

### Emergency rollback (production down)

If the production site is returning 5xx or the build is broken on `main`:

1. **Promote the previous deploy immediately** (step 2 above) — this is reversible and takes seconds.
2. **Open a `revert:` PR** of the offending commit so `main` matches what's actually serving traffic. Do **not** force-push to `main`.
3. Investigate and fix on a fresh branch.

## Cost & rate-limit monitoring

- **Anthropic:** check spend in the Anthropic Console at least weekly; the dashboard cap is the last line of defense if the code-side `ALLOWED_MODELS` allowlist fails open.
- **Supabase:** monitor egress, storage, and DB CPU in the Supabase Dashboard. Storage egress is the most likely first cost surprise as uploads scale.
- **Vercel:** monitor build minutes and serverless invocations; the AI routes are the long-running ones (Claude calls take 5–30s depending on model + image size).

## Useful links

- Vercel project: see Vercel dashboard (private)
- Supabase project: see Supabase dashboard (private)
- Anthropic console: <https://console.anthropic.com>
- Status pages: <https://www.vercel-status.com>, <https://status.supabase.com>, <https://status.anthropic.com>
