---
description: Run the IkoniK verification gate — install deps if needed, then lint, typecheck, test, and build. Use before declaring any task complete or before any push.
allowed-tools:
  - Bash
---

# verify-ikonik

The project's pre-commit gate. Confirms the change does not regress lint, types, tests, or production build.

## Steps

1. **Install if missing** (idempotent):
   ```bash
   [ -d node_modules ] || npm install --no-audit --no-fund --prefer-offline
   ```

2. **Lint** — ESLint via Next.js config:
   ```bash
   npm run lint
   ```

3. **Typecheck** — `tsc --noEmit` against strict mode:
   ```bash
   npm run typecheck
   ```

4. **Unit tests** — Vitest:
   ```bash
   npm test
   ```

5. **Production build** — `next build`:
   ```bash
   npm run build
   ```

## Pass criteria

All five steps exit with code 0. Any non-zero exit blocks the commit — fix the root cause; do not skip the gate.

## When this is not enough

Lint + typecheck + test + build prove the code is *correct*. They do not prove the feature *works*. For end-to-end behavioral confirmation, also run **`/verify`** (the built-in skill) to launch the app and exercise the change in a browser. This is mandatory for changes to:

- The upload pipeline (`src/lib/upload/*`, `src/app/api/upload/`)
- Auth flow (`src/app/auth/*`, `src/middleware.ts`)
- The convert / review AI routes
- Any UI change beyond a one-line copy edit
