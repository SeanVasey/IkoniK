# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Claude Fable 5 premium tier.** `claude-fable-5` (Anthropic's most intelligent model, new tier above Opus) is now selectable alongside Opus and Sonnet — added to `src/lib/constants.ts:MODELS`, all three `ALLOWED_MODELS` server allowlists, the convert page `MODEL_MAP`, the `ModelOption` store type, and the `ModelSelector` UI. Opt-in (not default) because of its 2× Opus pricing. See ADR 0002.
- **Conversion pipeline progress bar.** New `src/components/convert/PipelineProgress.tsx` shows the upload → analyze → convert stages with per-step status (done / active / error) and an animated progress bar (built on the previously unused `ProgressIndicator`, which now carries proper `role="progressbar"` ARIA attributes). Status line names the model doing the work.
- **Detailed analysis report.** New `src/components/convert/AnalysisReport.tsx` replaces the three-line analysis blurb with the full Vector Forge payload: image description, engine choice (with a plain-English hint), strategy, recommended preprocessing steps, detected layers with colour swatches, expected-fidelity badge, and any warnings. The convert page now parses the complete analysis JSON (tolerating markdown code fences) and the store's `ConversionAnalysis` type carries the optional `preprocessing`/`layers`/`warnings` fields.
- **Easier downloads.** Result downloads moved into a dedicated panel with a prominent full-width "Download SVG" primary button, PNG export, a copy-SVG-to-clipboard button with confirmation, and the output file size displayed. The Analyze button relabels to "Re-analyze Image" once an analysis exists, and Analyze/Convert are mutually disabled while either is in flight.
- `docs/decisions/0002-add-fable-5-and-bump-opus-to-4-8.md` — ADR for the new tier and the capable-tier bump.

- **Email magic-link sign-in.** `src/app/auth/page.tsx` gains a passwordless email option (`signInWithOtp`) alongside the OAuth buttons, routed through the existing `/auth/callback` code-exchange handler. Previously-swallowed `signInWithOAuth` errors are now surfaced to the user.
- **Database schema as source of truth.** `supabase/migrations/20260609000000_initial_schema.sql` defines the `profiles`, `uploads`, and `usage_log` tables, Row-Level Security policies (own-row reads, admin-only approval writes, service-role-only inserts), the private `uploads` storage bucket locked to per-user `users/{uid}/…` folders, and the signup trigger that provisions a profile from OAuth metadata. Previously the app depended on these objects but nothing in the repo created them. SECURITY DEFINER helpers (`is_admin`, `handle_new_user`) live in a non-API-exposed `private` schema so they stay off the PostgREST `/rest/v1/rpc/*` surface (clears the Supabase security advisor); tables are declared before the functions that reference them so a one-pass `supabase db push` succeeds on a fresh project. Applied + verified clean (0 advisor lints) on the live IkoniK project. Re-runnable.
- `docs/runbooks/supabase-setup.md` + `supabase/README.md` — setup walkthrough covering the env-var gotcha behind the production 500 (the app requires `NEXT_PUBLIC_`-prefixed Supabase vars; adding env vars requires a redeploy), applying migrations, OAuth provider config, and first-admin bootstrap.
- **IkoniK app icon + full PWA/favicon asset suite.** `public/icons/icon.svg` is the canonical source; `scripts/generate-icons.mjs` (`npm run icons:generate`) renders every transparent-background raster with Sharp — `icon-{1024,512,384,192,144,96}.png`, `apple-touch-icon{,-180,-167,-152,-120}.png`, `favicon-{32,16}.png`, and a multi-size `favicon.ico` (16/32/48) at the `public/` root. The icon anchors the `/auth` front-page splash and the README hero.
- `.github/workflows/ci.yml` — `secret-scan` job (gitleaks) to catch committed credentials, a least-privilege `permissions: contents: read` block (the default `GITHUB_TOKEN` was implicitly read/write), and run `concurrency` cancellation for superseded runs.
- `.claude/settings.json` — permissions allowlist for read-only and verify-gate commands, plus a `SessionStart` hook that runs `npm install` when `node_modules/` is missing.
- `.claude/skills/verify-ikonik/SKILL.md` — the project verification gate (install if needed, lint, typecheck, test, build).
- `.claude/skills/bump-claude-model/SKILL.md` — walks the capable-tier model upgrade across all eight call sites (constants, three API allowlists, UI MODEL_MAP, store type, selector label, README).
- `.claude/agents/svg-pipeline-reviewer.md` — proactive review of diffs touching the upload / convert / optimize / export pipeline.
- `docs/decisions/0001-bump-opus-to-4-7.md` — ADR documenting the capable-tier model bump and why a pure ID swap is safe for IkoniK's request shape.
- `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/global-error.tsx` — branded App Router fallbacks for 404, segment errors, and root errors (replaces Next.js's default unstyled pages).

### Changed

- **Capable-tier model bumped from `claude-opus-4-7` to `claude-opus-4-8`** across the eight call sites (constants, three API allowlists, MODEL_MAP, store type + default, ModelSelector, README). Opus 4.8 keeps the same API surface and pricing as 4.7, so this is a pure ID swap. See ADR 0002.
- **Sign-in methods limited to GitHub, Google, and email magic links.** Removed the Microsoft (Azure) OAuth button from `src/app/auth/page.tsx` and updated the README and Supabase setup runbook to document the supported set.
- **`src/middleware.ts`** — excluded `/manifest.json` from the auth matcher so the PWA manifest no longer returns `307 → /auth` for logged-out visitors.
- **`CLAUDE.md` modernised** for Claude Opus 4.7. Added sections on adaptive-thinking discipline (`ultrathink`, Plan mode), the built-in subagent roster (Explore, Plan, code-reviewer, general-purpose), built-in skills (`/verify`, `/code-review`, `/security-review`, `/run`, `/debug`, `/init`), and project-specific Model Configuration with the bump policy.
- **Capable-tier model bumped from `claude-opus-4-6` to `claude-opus-4-7`** across `src/lib/constants.ts`, `src/app/api/{claude,convert,review}/route.ts`, `src/app/convert/page.tsx` (MODEL_MAP), `src/stores/useAppStore.ts` (ModelOption type + default), `src/components/controls/ModelSelector.tsx`, and `README.md`. Sonnet 4.6 unchanged. See ADR 0001 for rationale.
- `docs/architecture.md` — replaced "tech stack TBD" placeholder with the actual stack and added a convert-pipeline data-flow diagram.
- `docs/runbooks/deploy.md` — filled in the Vercel-specific deployment + emergency rollback procedures (previously placeholder).
- `tasks/todo.md` — pruned items already shipped; added PWA icon suite generation as the priority backlog item.
- `src/app/layout.tsx` — expanded icon metadata: SVG + favicon variants for browsers and the full Apple touch set (180/167/152/120) so the iOS standalone PWA renders the icon on the Home Screen. `manifest.json` icon entries (`any` + `maskable`) now resolve to real files.
- **`next` and `eslint-config-next` bumped 14.2.35 → 15.5.18** to clear four high-severity Next.js advisories (DoS via Image Optimizer, request-smuggling in rewrites, RSC cache poisoning, App Router XSS) that were failing CI's `npm audit --audit-level=high` gate. React stays on 18.3; the codebase was already on the async `cookies()` API, so no app-code changes were required. `tsconfig.json` gains `"target": "ES2017"` (Next 15 default). Verified green: lint, typecheck, 22 tests, production build.
- In-range dependency refresh via `npm update` (`next` 15.5.18 → 15.5.19, `autoprefixer` 10.4 → 10.5, `@vitejs/plugin-react`, `vitest`, et al.) — all semver-compatible; lint, typecheck, 22 tests, and build stay green.

### Security

- **Patched `postcss` XSS advisory (GHSA-qx2v-qp2m-jg93, moderate).** `next` bundled `postcss@8.4.31` (< 8.5.10, vulnerable to XSS via unescaped `</style>` in stringify output). Added an npm `overrides` entry pinning `postcss` to `^8.5.10`, deduping every copy to the patched 8.5.15. `npm audit` is now clean at all severity levels. Surfaced by Dependabot alert #35.
- **CI workflow hardening.** Added a least-privilege `permissions: contents: read` block and a gitleaks secret-scanning job (see Added).

### Initial setup (pre-Unreleased)

- Initial project scaffolding with CLAUDE.md template
- Repository documentation (CHANGELOG, SECURITY, CODE_OF_CONDUCT, CONTRIBUTING)
- CI/CD pipeline via GitHub Actions
- Editor and environment configuration (.editorconfig, .gitignore, .env.example)
- Project structure: `.claude/`, `.github/workflows/`, `docs/`, `src/`, `tests/`, `tasks/`
