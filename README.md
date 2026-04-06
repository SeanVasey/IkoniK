<div align="center">

<!-- App icon placeholder — replace with /public/icons/icon-192.png once generated from master SVG -->
<img src="https://img.shields.io/badge/IkoniK-7C5CFC?style=for-the-badge&logoColor=white" alt="IkoniK logo" height="48" />

# IkoniK

**Claude-Powered Vector Graphics Studio**

Transform raster images into production-ready SVG vector graphics using Claude AI.

[![CI](https://github.com/SeanVasey/IkoniK/actions/workflows/ci.yml/badge.svg)](https://github.com/SeanVasey/IkoniK/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Powered by Claude](https://img.shields.io/badge/Powered_by-Claude_AI-7C5CFC)](https://anthropic.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

</div>

---

## Features

### Raster-to-Vector Conversion
- Upload PNG, JPEG, WebP, or GIF images (up to 10 MB)
- Claude AI analyses the image and recommends an optimal tracing strategy
- Generates production-quality SVG with proper viewBox, grouped layers, and minimal path count
- Side-by-side comparison view with zoom controls and background toggle
- Download results as SVG or PNG

### AI-Powered Analysis
- Automatic shape, colour, gradient, and complexity detection
- Engine recommendation (potrace for line art, vtracer for photographic content)
- Fidelity self-assessment: exact trace, faithful recreation, or interpretation
- Model selector: choose between Claude Opus 4.6 (most capable) or Sonnet 4.6 (fast)

### Secure Upload Pipeline
- Hybrid upload: proxy mode for files under 4.5 MB, signed-URL for larger files
- Magic-byte validation (file signature, not extension)
- SHA-256 integrity verification
- User-scoped storage paths in Supabase Storage

### Admin Dashboard
- User approval workflow (pending / approved / suspended)
- Usage monitoring per user
- OAuth provider visibility

### Design Mode (Coming Soon)
- Create original vector icons from text prompts

> **Status:** Early development. See [CHANGELOG.md](./CHANGELOG.md) for progress and [tasks/todo.md](./tasks/todo.md) for the roadmap.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org) (App Router) |
| Language | [TypeScript 5.6](https://www.typescriptlang.org) (strict mode) |
| Styling | [Tailwind CSS 3.4](https://tailwindcss.com) + custom glassmorphism design system |
| AI | [Claude API](https://docs.anthropic.com) via `@anthropic-ai/sdk` |
| Auth & DB | [Supabase](https://supabase.com) (Auth, Storage, Postgres with RLS) |
| State | [Zustand](https://zustand.docs.pmnd.rs) |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| Image Processing | [Sharp](https://sharp.pixelplumbing.com), [SVGO](https://svgo.dev), imagetracerjs |
| Testing | [Vitest](https://vitest.dev) + Testing Library |
| Deployment | [Vercel](https://vercel.com) |
| CI | [GitHub Actions](https://github.com/features/actions) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- A [Supabase](https://supabase.com) project
- An [Anthropic API key](https://console.anthropic.com)

### Installation

```bash
git clone https://github.com/SeanVasey/IkoniK.git
cd IkoniK
cp .env.example .env.local
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

| Variable | Scope | Description |
|----------|-------|-------------|
| `ANTHROPIC_API_KEY` | Server only | Your Anthropic API key for Claude AI calls |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Your Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anonymous/public key (safe for client — RLS enforces security) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Supabase service role key (bypasses RLS — never expose to client) |

> OAuth provider secrets (Google, GitHub, Microsoft) are configured in the **Supabase Dashboard** under Authentication > Providers, not in `.env.local`.

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Lint & Type Check

```bash
npm run lint
npm run typecheck
```

---

## Project Structure

```
IkoniK/
├── src/
│   ├── app/                  # Next.js App Router pages & API routes
│   │   ├── api/              # Backend endpoints (claude, convert, export, optimize, review, upload)
│   │   ├── auth/             # OAuth sign-in & callback
│   │   ├── convert/          # Main conversion interface
│   │   ├── design/           # Icon design (coming soon)
│   │   ├── admin/            # User management dashboard
│   │   ├── pending/          # Approval-pending status page
│   │   └── suspended/        # Account-suspended status page
│   ├── components/           # React components (canvas, controls, layout, shared, upload)
│   ├── lib/                  # Utilities (Anthropic client, Supabase clients, upload helpers, constants)
│   ├── stores/               # Zustand state (useAppStore, useConvertStore)
│   └── middleware.ts         # Route protection & auth checks
├── tests/                    # Vitest test suites
├── public/                   # Static assets & PWA manifest
├── docs/                     # Architecture docs & ADRs
├── .github/workflows/        # CI pipeline
└── tasks/                    # Deferred work tracking
```

For detailed architecture information, see [docs/architecture.md](./docs/architecture.md).

---

## Deployment

IkoniK is configured for **Vercel** deployment:

1. Connect the repository in your Vercel dashboard
2. Set the environment variables listed above in Vercel project settings
3. Build command: `next build` (auto-detected)
4. Output directory: `.next` (auto-detected)
5. Region: `iad1` (configured in `vercel.json`)

Preview deploys are created automatically on pull requests.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

## Credits

Created by [Sean Vasey](https://github.com/SeanVasey). Built with [Claude](https://anthropic.com) by **VASEY/AI**.
