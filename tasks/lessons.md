# Lessons Learned

Append entries here after non-trivial debugging sessions. Review at the start of each session.

---

### Patching a vulnerable transitive dependency (postcss inside next)

- **Symptom:** Dependabot flagged `postcss` XSS (GHSA-qx2v-qp2m-jg93). The top-level `postcss` was already patched (8.5.15); the vulnerable copy (8.4.31) was bundled under `node_modules/next/node_modules/postcss`. `npm audit fix --force` wanted to downgrade `next` to 9.3.3 — nonsense.
- **Fix:** Add an npm `overrides` entry (`"postcss": "^8.5.10"`) to dedupe every nested copy to the patched version. Non-breaking (8.4 → 8.5 is a semver-compatible minor). `npm ls postcss` shows `overridden`; `npm audit` goes clean.
- **Gotcha:** I first used the `"$postcss"` reference form (mirror the direct dep). `npm install` accepted it, but `npm update` then aborted with `Unable to resolve reference $postcss`. Use an explicit version range in `overrides` to keep all npm subcommands working.
- **Check next time:** when audit blames a nested dep, confirm where it lives with `npm ls <pkg>` before touching the parent's version. Prefer `overrides` over a major framework bump.

### Dead hamburger button — orphaned store state

- **Symptom:** The mobile hamburger did nothing. Handler was wired (`toggleSidebar`), state updated correctly — but **no component anywhere rendered the sidebar**. Worse, `sidebarOpen` defaulted to `true`, so the first tap "closed" a drawer that had never existed.
- **Fix:** Built `NavDrawer` to consume the state, flipped the default to `false`, added a regression test asserting the closed-by-default state and Esc-close behavior.
- **Check next time:** when a button "does nothing", don't stop at confirming the handler fires — trace the state to a *consumer*. Orphaned zustand fields look exactly like working code. Also grep for components that read the field (`sidebarOpen` had zero readers).
- **Bonus gotcha:** `Header` read `user` from the app store but nothing ever called `setUser`, so the avatar/sign-out menu never appeared for anyone. UI driven by store state needs an owner that populates it — or should read the source (Supabase session) directly.

### "The app is down" but Vercel says READY — Supabase free-tier auto-pause

- **Symptom:** Landing page and /login return 200, deployment READY, yet sign-in fails and every protected route bounces to /login. Nothing was deployed for ~a month.
- **Diagnosis path:** local build passed → latest Vercel prod deploy READY → curled the real production domain (note: only `ikonik-zeta.vercel.app` is public; the `-vaseymultimedia` and git-branch aliases sit behind Vercel SSO and 302 for anonymous visitors — don't mistake that for the outage). Extracted `NEXT_PUBLIC_SUPABASE_URL` from the deployed JS bundle, and the host **didn't resolve in DNS**. Paused Supabase projects lose their DNS record entirely.
- **Why it looks half-alive:** `src/middleware.ts` treats a failed `supabase.auth.getUser()` (network error) the same as "no session" → redirect to /login instead of a 500. The static shell renders fine; only everything that touches Supabase is dead.
- **Fix:** Restore the project in the Supabase Dashboard (must happen within 90 days of pausing). Prevention: `.github/workflows/keepalive.yml` pings the REST gateway twice a week once `KEEPALIVE_SUPABASE_*` secrets are set.
- **Check next time:** for "app down" reports, check the *backend's* DNS/health first when the frontend returns 200 — `curl https://<ref>.supabase.co/auth/v1/health`. And remember free-tier Supabase pauses after ~7 idle days.
