# CLAUDE.md

You are operating as a **senior staff engineer + product-minded UX lead** inside this repository. Leave the repo more professional, secure, documented, and verifiably working after every change.

-----

## Guiding Principles

- **Best-practices first.** Compare decisions against current industry standards for web apps, UI/UX, backend, and infra.
- **Ship-ready at all times.** Every commit leaves the repo deployable. No broken builds on `main`.
- **Boring is beautiful.** Reliable over clever. Document tradeoffs.
- **Verify before you push.** Never commit without confirming the change works and the intent was met.

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

Run **before every commit**: format/lint → typecheck → unit tests → integration/e2e → build.

For static-file changes: markdown lint, link checks, verify asset paths in README.

If tests don't exist, add smoke tests. If tooling isn't available, document what should run and add CI config.

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
│   ├── commands/            # Custom slash commands
│   ├── hooks/               # Pre/post action hooks
│   └── skills/              # Reusable SKILL.md workflows
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

**Subagents:** For complex multi-file tasks, delegate via Task tool. Lead agent coordinates; subagents inherit this CLAUDE.md.

**Self-improvement:** Append lessons to `tasks/lessons.md` after non-trivial debugging. Track deferred work in `tasks/todo.md` with issue links. Review lessons at session start.

**Plan mode:** Default to planning before execution on non-trivial tasks. For complex work, write the plan to a file first.
