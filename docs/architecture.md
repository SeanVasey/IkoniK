# Architecture

## Overview

IkoniK is a Claude-powered vector graphics studio. Today it focuses on raster → SVG conversion with AI-driven analysis and fidelity review; a generative "design from prompt" mode is on the roadmap.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, edge-aware) |
| Language | TypeScript 5.6, strict mode |
| Styling | Tailwind CSS 3.4 + custom glassmorphism design tokens |
| AI | Anthropic SDK (`@anthropic-ai/sdk`) — Fable 5 (premium tier) / Opus 4.8 (capable tier) / Sonnet 4.6 (fast tier) |
| Auth + DB + Storage | Supabase (Auth, Postgres with RLS, Storage) |
| Client state | Zustand (no persist middleware — UI state resets per session) |
| Animation | Framer Motion |
| Image processing | Sharp (raster transforms), SVGO (SVG minification), imagetracerjs (browser-side tracing) |
| Tests | Vitest + Testing Library |
| Hosting | Vercel (region `iad1`, see `vercel.json`) |
| CI | GitHub Actions (`.github/workflows/ci.yml`) |

## Convert pipeline — data flow

```
┌──────────┐   1   ┌────────────────────┐   2   ┌────────────────┐
│  Client  │ ────▶ │ /api/upload route  │ ────▶ │   Supabase     │
│ DropZone │       │ (auth + magic-byte │       │   Storage      │
└──────────┘       │  validate)         │       │ (per-user path)│
      │            └────────────────────┘       └────────────────┘
      │                                                 │
      │ 3 (uploadPath)                                  │
      ▼                                                 │
┌──────────────────┐         4 (fetch base64)           │
│  /api/claude     │ ◀──────────────────────────────────┘
│  (image analysis)│
└──────────────────┘
      │
      │ 5 (analysis JSON)
      ▼
┌──────────────────┐
│  /api/convert    │ ── 6 (SVG markup) ──▶  Client renders side-by-side
│  (SVG generation)│
└──────────────────┘
      │
      │ optional
      ▼
┌──────────────────┐
│  /api/review     │ ── PSNR / SSIM / fidelity label
│  (fidelity audit)│
└──────────────────┘
```

1. Client uploads via `DropZone` — files ≤ 4.5 MB use proxy mode through `/api/upload`; larger files take the signed-URL path. Both paths validate by **magic-byte signature**, not extension, before storage.
2. Storage path is scoped per-user (`{userId}/...`) and enforced by RLS.
3. The client passes the storage `uploadPath` to subsequent API calls — not the raw bytes.
4. `/api/claude` fetches the upload server-side, base64-encodes it, and asks Claude to analyse shapes, colours, complexity, and recommend a tracing strategy. Returns structured JSON.
5. `/api/convert` takes the analysis + image and returns raw SVG markup (no markdown fences).
6. Optional: `/api/review` compares the rendered SVG to the source, scoring fidelity.

## Model wiring

Single source of truth: `src/lib/constants.ts:MODELS`. Mirrored in three server-side `ALLOWED_MODELS` allowlists (`/api/claude`, `/api/convert`, `/api/review`) and the UI `MODEL_MAP` (`src/app/convert/page.tsx`). See `docs/decisions/0002-add-fable-5-and-bump-opus-to-4-8.md` for the current tier choices. To upgrade, use the `bump-claude-model` skill (`.claude/skills/bump-claude-model/SKILL.md`).

## Project Structure

```
project-root/
├── CLAUDE.md              # AI assistant guidelines (read at session start)
├── README.md              # Public-facing product page
├── LICENSE                # MIT
├── CHANGELOG.md           # Keep-a-Changelog format
├── SECURITY.md            # Vulnerability reporting
├── .editorconfig          # Editor consistency
├── .gitignore             # Includes .env.local, node_modules, .next
├── .env.example           # Required env vars (Supabase + Anthropic)
│
├── .claude/               # Claude Code configuration
│   ├── settings.json      # Permissions allowlist + SessionStart npm install hook
│   ├── agents/            # Project subagents (e.g. svg-pipeline-reviewer)
│   ├── commands/          # Custom slash commands
│   ├── hooks/             # Pre/post action hooks
│   └── skills/            # Reusable SKILL.md workflows
│       ├── verify-ikonik/
│       └── bump-claude-model/
│
├── .github/workflows/     # CI: lint, typecheck, test, build
│   └── ci.yml
│
├── docs/
│   ├── architecture.md    # This file
│   ├── decisions/         # ADRs (0001-bump-opus-to-4-7.md)
│   └── runbooks/          # Operational procedures (deploy.md)
│
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # Server routes (claude, convert, review, upload, ...)
│   │   ├── auth/          # OAuth sign-in + callback
│   │   ├── convert/       # Main conversion UI
│   │   ├── design/        # Generative mode (coming soon)
│   │   ├── admin/         # Approval / suspension dashboard
│   │   ├── pending/       # Status: account pending approval
│   │   └── suspended/     # Status: account suspended
│   ├── components/        # React components by domain (canvas, controls, upload, ...)
│   ├── lib/               # Anthropic client, Supabase clients, upload helpers, constants
│   ├── stores/            # Zustand (useAppStore, useConvertStore — no persist)
│   └── middleware.ts      # Route protection
│
├── tests/                 # Vitest suites
└── public/
    └── icons/             # PWA assets (master SVG + generated PNGs — pending; see tasks/todo.md)
```

## Key Decisions

Architecture Decision Records (ADRs) are stored in `docs/decisions/`. See that directory for the rationale behind significant technical choices.
