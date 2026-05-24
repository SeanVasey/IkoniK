# Todo

Deferred work items tracked here. Link to GitHub issues when available.

## Backlog

- [ ] **Generate master SVG logo and full PWA icon suite** per `CLAUDE.md` → "PWA & Icon Assets" spec. `public/manifest.json` currently references PNGs that do not exist. Required assets (all transparent, generated from one master SVG):
  - `icon-{1024,512,384,192,144,96}.png` in `public/icons/`
  - `apple-touch-icon{,-180,-167,-152,-120}.png` in `public/icons/`
  - `favicon-{32,16}.png` in `public/icons/`, plus `favicon.ico` (multi-size 16/32/48) at project root
  - Manifest entries with both `"purpose": "any"` and `"purpose": "maskable"` for 192 and 512 sizes
  - Required `<head>` tags (`apple-mobile-web-app-capable`, status-bar style)
- [ ] Implement design mode (vector-from-prompt)
- [ ] Add admin dashboard analytics (per-user usage trends, cost attribution)
- [ ] Re-baseline Anthropic token cost dashboard against Opus 4.7 (re-run `count_tokens()` on representative uploads — see ADR 0001)
- [ ] Wire `npm audit --omit=dev --audit-level=high` into CI as a hard gate (currently informational)
