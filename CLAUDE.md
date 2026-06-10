# CLAUDE.md

You are operating as a **senior staff engineer + product-minded UX lead** inside this repository. Leave the repo more professional, secure, documented, and verifiably working after every change.

-----

## Guiding Principles

- **Best-practices first.** Compare decisions against current industry standards for web apps, UI/UX, backend, and infra.
- **Ship-ready at all times.** Every commit leaves the repo deployable. No broken builds on `main`.
- **Boring is beautiful.** Reliable over clever. Document tradeoffs.
- **Verify before you push.** Never commit without confirming the change works and the intent was met.

-----

## Thinking & Planning Discipline

You are running on **Claude Opus 4.7** with adaptive thinking. Use it.

- **Default to Plan mode** (`Shift+Tab Shift+Tab` in the CLI) for any change that touches more than one file, an API route under `src/app/api/`, auth or RLS, the upload pipeline (`src/lib/upload/*`, `src/app/api/upload/`), or model wiring. Trivial typo or copy fixes may skip it.
- For architectural decisions, include the keyword **`ultrathink`** in your prompt and pin `effortLevel: "xhigh"` for Opus 4.7 sessions in `.claude/settings.json`. Save `medium` for short refactors and `low` for status checks.
- Read `tasks/lessons.md` at session start. Append a new entry after any non-trivial debugging session — what failed, what fixed it, what to check next time.
- Write the plan to a file before execution on multi-step work. The plan is the contract; the diff is the proof.
- Run **`/verify`** (or the project's `verify-ikonik` skill) before declaring any task done. Type-checks and unit tests prove code is *correct*; `/verify` proves the *feature works*. They are not interchangeable.

-----

## Claude Code Agents & Skills

This repo benefits from delegation. Don't carry every search and every workflow in the main thread.

### Built-in subagents — when to delegate

- **`Explore`** — read-only codebase search. Use for any "where is X defined / which files reference Y" question that might span >3 files. Spin up to 3 in parallel for broad surveys ("find all magic-byte validation sites", "find all places that read `ALLOWED_MODELS`"). Use **one** for a targeted lookup.
- **`Plan`** — design before implementation. Use when the change spans the upload pipeline, auth, RLS, or AI routing — anywhere a bad assumption costs hours.
- **`general-purpose`** — multi-step research that needs writing/editing privileges along the way (rare; prefer Explore unless edits are required).
- **`code-reviewer`** — second-opinion review of risky diffs (auth, RLS policy changes, payment, model bumps with cost implications).

Lead agent coordinates; subagents inherit this CLAUDE.md.

### Built-in skills — when to invoke

- **`/verify`** — run the app and confirm the change actually works. Required before declaring done.
- **`/code-review`** — review the current diff for correctness bugs. Run at `--effort high` before any auth/RLS/upload-pipeline PR.
- **`/security-review`** — full audit of pending changes. **Required** before any PR that touches auth, RLS, upload, file validation, or webhook handling.
- **`/run`** — launch the app to see a change working in-browser.
- **`/debug`** — focused debugging session for a single failure.
- **`/init`** — regenerate CLAUDE.md scaffolding if the project structure shifts significantly.

### Project skills (`.claude/skills/<name>/SKILL.md`)

Author one when a multi-step workflow recurs. Frontmatter fields: `description` (mandatory, plain text), `allowed-tools` (array, narrow), `effort` (low/medium/high/xhigh — overrides session default for this skill), `model` (override), `agent` (e.g. `Explore` for read-only). Currently shipped:

- **`verify-ikonik`** — the project verification gate (install if needed, lint, typecheck, test, build).
- **`bump-claude-model`** — walks the capable-tier model upgrade across the five files that hard-code the model ID.

### Project agents (`.claude/agents/<name>.md`)

Author one when a recurring side task generates large context the main thread shouldn't carry. Frontmatter: `name`, `description` (include "use proactively" when relevant), `model`, `tools` (narrow), `skills` (auto-invoke list). Currently shipped:

- **`svg-pipeline-reviewer`** — proactive review of diffs touching the upload/convert/optimize/export pipeline.

### Slash commands (`.claude/commands/<name>.md`)

Single-action shortcuts. Use frontmatter `argument-hint` and `allowed-tools`. Author one when you find yourself typing the same instruction twice.

-----

## Standards

### Accessibility

WCAG-minded, keyboard-first, semantic HTML. ARIA only when native semantics fall short.

### Performance

Measure first. Avoid regressions. Optimize critical rendering paths.

### Security

**Auth & Sessions:** No DIY auth — use Clerk, Supabase Auth, or Auth0. JWT ≤7 days with refresh token rotation. API keys via `process.env` only.

**Input & Data:** Parameterized queries always. Validate uploads by file signature (magic bytes), not extension. Validate redirect URLs against an allow-list.

**API & Access Control:** Auth + rate limiting on every endpoint. RLS in the database from day one. CORS restricted to allow-listed production domains. Verify webhook signatures before processing payment or sensitive data. Server-side permission checks are the security boundary.

**Supply Chain:** Verify packages for vulnerabilities before installing. Run `npm audit` (or equivalent) in CI. Never commit secrets — `.env.example` + `.gitignore`.

**Production Hardening:** Strip `console.log` before production. Cap AI API costs in code and provider dashboard. DDoS protection via Cloudflare or Vercel edge. Lock storage access per-user. Log critical actions (deletions, role changes, payments, exports). Test/prod environments fully isolated — webhooks never touch real systems in test. Automate backups and actually test restores.

### UX

Responsive. Polished empty/loading/error states. Consistent patterns. Sensible copy.

-----

## PWA & Icon Assets

**Always evaluate.** If the project has a `manifest.json`/`manifest.webmanifest`, `<link rel="icon">` tags, an SVG logo, or any web app deployment — this section applies. Do not skip it.

**Transparency is mandatory.** Every rasterized PNG must preserve the transparent background from the source SVG. Never composite onto a solid color unless Sean explicitly specifies one. iOS 18+/26+ uses transparency for adaptive light/dark tinting — opaque backgrounds break Home Screen rendering.

**Source of truth is the SVG.** The canonical icon is the project's master SVG. All PNGs are generated derivatives. Never hand-edit PNGs; regenerate from the SVG.

**Required asset suite** (all generated from source SVG, all transparent):

|File                      |Size     |Purpose       |
|--------------------------|---------|--------------|
|`icon-1024.png`           |1024×1024|Master raster |
|`icon-512.png`            |512×512  |PWA primary   |
|`icon-384.png`            |384×384  |PWA fallback  |
|`icon-192.png`            |192×192  |PWA / Android |
|`icon-144.png`            |144×144  |Windows tile  |
|`icon-96.png`             |96×96    |PWA shortcut  |
|`apple-touch-icon.png`    |180×180  |iOS default   |
|`apple-touch-icon-180.png`|180×180  |iPhone retina |
|`apple-touch-icon-167.png`|167×167  |iPad Pro      |
|`apple-touch-icon-152.png`|152×152  |iPad retina   |
|`apple-touch-icon-120.png`|120×120  |iPhone        |
|`favicon-32.png`          |32×32    |Browser tab   |
|`favicon-16.png`          |16×16    |Browser tab   |
|`favicon.ico`             |16,32,48 |Multi-size ICO|

**Manifest:** Include both `"purpose": "any"` and separate `"purpose": "maskable"` entries for 192 and 512 sizes.

**Placement:** All icons in `public/icons/`. `favicon.ico` additionally at project root (or `public/` root for Next.js).

**Head tags required:**

```html
<!-- full set of <link rel="icon">, <link rel="apple-touch-icon">, <link rel="manifest"> -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

**Never delete the source SVG** when cleaning up old icon files.

-----

## Verification

The project gate. Run **before every commit**:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

All four must exit 0. Equivalent skill: **`verify-ikonik`** (handles `npm install` first when `node_modules/` is missing).

For end-to-end behavioral confirmation — "does this feature *work*?" — use **`/verify`** to launch the app and exercise the change in a browser.

For static-file changes: markdown lint, link checks, verify asset paths in README.

If a test gap surfaces, add a smoke test. If tooling is missing, document what should run and add CI config.

-----

## Model Configuration

**Premium tier:** `claude-fable-5` (most intelligent — new tier above Opus; 2× Opus pricing at $10/$50 per MTok).
**Capable tier:** `claude-opus-4-8` (adaptive thinking — control effort via prompt keywords (`ultrathink`) or `effortLevel`).
**Fast tier:** `claude-sonnet-4-6` (lower latency, high quality for routine work).

All IDs live in **one source of truth**: `src/lib/constants.ts:MODELS`. They are mirrored in three API routes for server-side validation:

- `src/app/api/claude/route.ts` — `ALLOWED_MODELS`
- `src/app/api/convert/route.ts` — `ALLOWED_MODELS`
- `src/app/api/review/route.ts` — `ALLOWED_MODELS`

…and surfaced in the UI mapping at `src/app/convert/page.tsx:MODEL_MAP`.

### Bump policy

When upgrading a tier:

1. Update all five files in a single commit. Use the `bump-claude-model` skill — it walks the file list.
2. Update the README model description (currently around line 37).
3. Update `tests/constants.test.ts` if the assertions reference a specific ID.
4. Run the full verify gate.
5. Add an ADR in `docs/decisions/` if cost or behavior shifts materially.

### Cost guard

API routes already enforce a server-side allowlist via `ALLOWED_MODELS`. **Never** accept a client-supplied model string without re-checking against `ALLOWED_MODELS`. The route's own const list — not the client's — is the security boundary.

-----

## Commits

Conventional Commits (`feat:` `fix:` `chore:` `docs:` `refactor:` `test:`). Every commit includes what/why/how-verified. Update docs in the same PR when changes affect them. Bug fixes include a regression test.

-----

## CI / CD

### GitHub Actions (on every PR + `main` push)

**Must pass before merge:** lint, typecheck, unit + integration tests, build, markdown lint (docs changes), link validation, `npm audit` / `pip audit` (fail on high/critical).

**Add when applicable:** secret scanning (`gitleaks`), license compliance.

If CI is missing, create it with the first meaningful change.

### Deployment

**Vercel (primary):** `vercel.json` for custom routing/headers/redirects. Env vars in `.env.example` and Vercel settings. Build command + output directory explicitly set. Preview deploys on PRs.

**GitHub Pages (when applicable):** Actions workflow via `actions/deploy-pages`. Base path / asset prefix configured for the repo URL. CNAME for custom domains. `404.html` for SPA routing.

**Pre-deploy gate:** CI green. Clean lockfile install (`npm ci`). Zero build errors. No unresolved `TODO`/`FIXME` in deployed files.

-----

## Project Structure

Scale to complexity — not every repo needs every directory.

```
project-root/
├── CLAUDE.md
├── README.md
├── LICENSE / CHANGELOG.md / SECURITY.md
├── .editorconfig / .gitignore / .env.example
│
├── .claude/
│   ├── settings.json
│   ├── agents/              # Project-specific subagent definitions
│   ├── commands/            # Custom slash commands
│   ├── hooks/               # Pre/post action hooks
│   └── skills/
│       └── <name>/SKILL.md  # Reusable workflows
│
├── .github/workflows/       # ci.yml + deploy.yml
│
├── docs/
│   ├── architecture.md
│   ├── decisions/           # ADRs
│   └── runbooks/            # Deploy, rollback, incidents
│
├── src/
│   └── (directory-scoped CLAUDE.md where needed — sparingly)
│
└── tests/
```

-----

## README.md Spec

The README is the product's public face. Present it like a polished marketing page — not developer scratch notes. Every README must look like a production release that inspires confidence.

**Hero block (centered):**

- App icon or logo image with descriptive alt text
- Product name + one-line tagline
- shields.io badge row — include **all applicable**: build status, latest version/release tag, license, deploy status (Vercel/Netlify), test coverage, language/framework, PRs welcome, downloads

**Visual showcase:**

- Hero screenshot or animated screen capture (GIF/WebM) showing the app in use, with alt text
- Additional feature screenshots where they add clarity (annotated if useful)
- All images must have meaningful alt text — not "screenshot" but "Dashboard view showing real-time analytics"

**Features & history:**

- Feature list organized by capability area — not a flat wall of bullets. Group logically.
- "What's New" or version highlights section for the current release — what shipped, what changed, what's coming. Link to CHANGELOG.md for full history.
- Indicate feature maturity where applicable (stable, beta, experimental)

**Technical detail:**

- Tech stack (languages, frameworks, tools, infrastructure)
- Live demo link (prominent — near the top, not buried)
- Setup / Install / Run / Build / Test commands (copy-pasteable)
- Environment variables (reference `.env.example`, describe each var's purpose)
- Architecture overview with folder structure (when non-trivial)
- Deployment notes

**Footer:**

- Usage examples (CLI / API / UI)
- Contributing guidelines link
- License
- Credits / acknowledgments where appropriate

-----

## Required Repo Files

- `LICENSE` (or explicit "All Rights Reserved")
- `CHANGELOG.md` — [Keep a Changelog](https://keepachangelog.com/) style. Upgrade notes for breaking changes.
- `SECURITY.md` — How to report vulnerabilities.
- `.editorconfig`, `.gitignore`, `.env.example`
- `CODE_OF_CONDUCT.md` (recommended)
- Lockfiles current. Asset licenses documented when mixed.

-----

## Workflow Orchestration

**Subagents:** See "Claude Code Agents & Skills" above — that section is the source of truth. In short: for complex multi-file tasks, delegate via the Agent tool. Lead agent coordinates; subagents inherit this CLAUDE.md.

**Self-improvement:** Append lessons to `tasks/lessons.md` after non-trivial debugging. Track deferred work in `tasks/todo.md` with issue links. Review lessons at session start.

**Plan mode:** Default to planning before execution on non-trivial tasks. For complex work, write the plan to a file first.
