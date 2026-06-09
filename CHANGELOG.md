# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `.github/workflows/ci.yml` — `secret-scan` job (gitleaks) to catch committed credentials, a least-privilege `permissions: contents: read` block (the default `GITHUB_TOKEN` was implicitly read/write), and run `concurrency` cancellation for superseded runs.
- `.claude/settings.json` — permissions allowlist for read-only and verify-gate commands, plus a `SessionStart` hook that runs `npm install` when `node_modules/` is missing.
- `.claude/skills/verify-ikonik/SKILL.md` — the project verification gate (install if needed, lint, typecheck, test, build).
- `.claude/skills/bump-claude-model/SKILL.md` — walks the capable-tier model upgrade across all eight call sites (constants, three API allowlists, UI MODEL_MAP, store type, selector label, README).
- `.claude/agents/svg-pipeline-reviewer.md` — proactive review of diffs touching the upload / convert / optimize / export pipeline.
- `docs/decisions/0001-bump-opus-to-4-7.md` — ADR documenting the capable-tier model bump and why a pure ID swap is safe for IkoniK's request shape.
- `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/global-error.tsx` — branded App Router fallbacks for 404, segment errors, and root errors (replaces Next.js's default unstyled pages).

### Changed

- **`CLAUDE.md` modernised** for Claude Opus 4.7. Added sections on adaptive-thinking discipline (`ultrathink`, Plan mode), the built-in subagent roster (Explore, Plan, code-reviewer, general-purpose), built-in skills (`/verify`, `/code-review`, `/security-review`, `/run`, `/debug`, `/init`), and project-specific Model Configuration with the bump policy.
- **Capable-tier model bumped from `claude-opus-4-6` to `claude-opus-4-7`** across `src/lib/constants.ts`, `src/app/api/{claude,convert,review}/route.ts`, `src/app/convert/page.tsx` (MODEL_MAP), `src/stores/useAppStore.ts` (ModelOption type + default), `src/components/controls/ModelSelector.tsx`, and `README.md`. Sonnet 4.6 unchanged. See ADR 0001 for rationale.
- `docs/architecture.md` — replaced "tech stack TBD" placeholder with the actual stack and added a convert-pipeline data-flow diagram.
- `docs/runbooks/deploy.md` — filled in the Vercel-specific deployment + emergency rollback procedures (previously placeholder).
- `tasks/todo.md` — pruned items already shipped; added PWA icon suite generation as the priority backlog item.
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
