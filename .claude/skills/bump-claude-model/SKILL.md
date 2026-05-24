---
description: Bump the capable-tier Claude model ID across IkoniK. Use when upgrading from one Opus generation to the next (e.g. 4.6 → 4.7), or when retiring an older model. Walks every file that hard-codes a model ID so nothing falls out of sync.
allowed-tools:
  - Read
  - Edit
  - Bash
  - Grep
---

# bump-claude-model

The model ID is referenced in **eight places**. Miss one and the server-side allowlist will reject the upgrade or the UI will display a stale name. This skill walks them in order.

## Inputs

- `OLD_ID` — the model ID being retired (e.g. `claude-opus-4-6`)
- `NEW_ID` — the model ID replacing it (e.g. `claude-opus-4-7`)
- `NEW_NAME` — short human name (e.g. `Opus 4.7`)
- `NEW_DESCRIPTION` — UI-facing description (e.g. `Most capable, adaptive thinking`)

## Steps

1. **Confirm the surface area** — sanity-check no surprise references exist:
   ```bash
   grep -rn "OLD_ID" src/ tests/ README.md docs/ --include='*.ts' --include='*.tsx' --include='*.md'
   ```

2. **Update the source of truth** — `src/lib/constants.ts`:
   - Replace `id: 'OLD_ID'` with `id: 'NEW_ID'`
   - Replace `name: '<old name>'` with `name: 'NEW_NAME'`
   - Update the `description` field

3. **Update the server-side allowlists** (three files, identical literal):
   - `src/app/api/claude/route.ts` — line ~10, `ALLOWED_MODELS`
   - `src/app/api/convert/route.ts` — line ~6, `ALLOWED_MODELS`
   - `src/app/api/review/route.ts` — line ~10, `ALLOWED_MODELS`

4. **Update the UI mapping** — `src/app/convert/page.tsx`:
   - `MODEL_MAP` keys (e.g. `'opus-4.7'`) and values (`'claude-opus-4-7'`)
   - Verify the default fallback near the bottom still points at the Sonnet tier (not the old Opus)

5. **Update tests** — `tests/constants.test.ts`:
   - Any assertion that mentions the specific model ID

6. **Update README** — `README.md`:
   - The "AI-Powered Analysis" section's model description (around line 37)

7. **Optional but recommended** — add a brief ADR in `docs/decisions/`:
   - Filename: `NNNN-bump-opus-to-X-Y.md`
   - Sections: Context, Decision, Consequences (cost, latency, behavior changes)

8. **Run the verify gate**:
   ```bash
   npm run lint && npm run typecheck && npm test && npm run build
   ```

9. **Commit** — single Conventional Commit:
   ```
   feat(ai): bump capable-tier model OLD_ID → NEW_ID
   ```

## Why all eight

The three API routes carry their own `ALLOWED_MODELS` const arrays because the route is the security boundary — clients cannot be trusted to pick a model. `MODEL_MAP` in the UI translates the human-friendly Zustand store value to the API ID. `constants.ts` is the single source of truth for the *selector list*. The README is the public-facing model name. Drift between any of these silently breaks the upgrade.
