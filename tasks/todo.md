# Todo

Deferred work items tracked here. Link to GitHub issues when available.

## Backlog

- [ ] Implement design mode (vector-from-prompt)
- [ ] Add admin dashboard analytics (per-user usage trends, cost attribution)
- [ ] Re-baseline Anthropic token cost dashboard against Opus 4.7 (re-run `count_tokens()` on representative uploads — see ADR 0001)

## Done

- [x] **Master SVG + full PWA/favicon icon suite** generated from `public/icons/icon.svg` via `scripts/generate-icons.mjs`; icon integrated into the `/auth` splash and README hero; iOS Apple-touch metadata wired in `layout.tsx`; manifest entries resolve to real files.
- [x] `npm audit --audit-level=high` enforced as a hard CI gate (fails the build); gitleaks secret scanning added alongside it, plus least-privilege `GITHUB_TOKEN` permissions.
