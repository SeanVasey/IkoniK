# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `.claude/settings.json` — permissions allowlist for read-only and verify-gate commands, plus a `SessionStart` hook that runs `npm install` when `node_modules/` is missing.
- `.claude/skills/verify-ikonik/SKILL.md` — the project verification gate (install if needed, lint, typecheck, test, build).
- `.claude/skills/bump-claude-model/SKILL.md` — walks the capable-tier model upgrade across all eight call sites (constants, three API allowlists, UI MODEL_MAP, store type, selector label, README).
- `.claude/agents/svg-pipeline-reviewer.md` — proactive review of diffs touching the upload / convert / optimize / export pipeline.
- `docs/decisions/0001-bump-opus-to-4-7.md` — ADR documenting the capable-tier model bump and why a pure ID swap is safe for IkoniK's request shape.

### Changed

- **`CLAUDE.md` modernised** for Claude Opus 4.7. Added sections on adaptive-thinking discipline (`ultrathink`, Plan mode), the built-in subagent roster (Explore, Plan, code-reviewer, general-purpose), built-in skills (`/verify`, `/code-review`, `/security-review`, `/run`, `/debug`, `/init`), and project-specific Model Configuration with the bump policy.
- **Capable-tier model bumped from `claude-opus-4-6` to `claude-opus-4-7`** across `src/lib/constants.ts`, `src/app/api/{claude,convert,review}/route.ts`, `src/app/convert/page.tsx` (MODEL_MAP), `src/stores/useAppStore.ts` (ModelOption type + default), `src/components/controls/ModelSelector.tsx`, and `README.md`. Sonnet 4.6 unchanged. See ADR 0001 for rationale.
- `docs/architecture.md` — replaced "tech stack TBD" placeholder with the actual stack and added a convert-pipeline data-flow diagram.
- `docs/runbooks/deploy.md` — filled in the Vercel-specific deployment + emergency rollback procedures (previously placeholder).
- `tasks/todo.md` — pruned items already shipped; added PWA icon suite generation as the priority backlog item.

### Initial setup (pre-Unreleased)

- Initial project scaffolding with CLAUDE.md template
- Repository documentation (CHANGELOG, SECURITY, CODE_OF_CONDUCT, CONTRIBUTING)
- CI/CD pipeline via GitHub Actions
- Editor and environment configuration (.editorconfig, .gitignore, .env.example)
- Project structure: `.claude/`, `.github/workflows/`, `docs/`, `src/`, `tests/`, `tasks/`
