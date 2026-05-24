# ADR 0001: Bump capable-tier model from Opus 4.6 to Opus 4.7

- **Status:** Accepted
- **Date:** 2026-05-24

## Context

IkoniK's capable-tier model was pinned to `claude-opus-4-6` across `src/lib/constants.ts`, three API routes (`/api/claude`, `/api/convert`, `/api/review`), the convert page's `MODEL_MAP`, the Zustand `useAppStore`, and the `ModelSelector` UI. Anthropic shipped Opus 4.7 with adaptive-only thinking, improved vision (high-resolution image support up to 2576px), and stronger long-horizon agentic behavior, while keeping standard API pricing on the 1M context window.

IkoniK's vision pipeline (`/api/claude` analyses uploaded raster images) benefits directly from the high-resolution improvement — the existing 10 MB upload cap easily produces images above the prior 1568px limit, and 4.7 maps coordinates 1:1 to pixels, removing scale-factor concerns if the analysis result ever drives downstream coordinates.

## Decision

Replace `claude-opus-4-6` with `claude-opus-4-7` everywhere the capable-tier model is referenced. Keep Sonnet 4.6 as the fast tier (no parallel bump needed; 4.6 remains current). UI label updates to "Opus 4.7 — Most capable, adaptive thinking".

## Why a pure ID swap is safe for IkoniK

The IkoniK API routes call `callClaude({model, system, maxTokens, messages})` only. They do not set:

- `temperature`, `top_p`, `top_k` (removed on 4.7 — would 400)
- `thinking: {type: "enabled", budget_tokens}` (removed on 4.7 — would 400)
- Assistant-turn prefills (return 400 on 4.6/4.7)
- `output_format` (deprecated API-wide)

None of the 4.6→4.7 breaking-change items apply. The bump is a literal string swap in eight call sites (see `bump-claude-model` skill for the walkthrough).

## Consequences

### Cost

Per-token pricing is identical to Opus 4.6 ($5/$25 per 1M input/output tokens). However, 4.7 tokenises text slightly differently and consumes ~3× more tokens per high-resolution image than prior Opus models. Re-baseline with `count_tokens()` against representative uploads before reacting to any measured cost shift; downsample client-side only if fidelity headroom isn't needed (do not downsample by default).

### Latency

Adaptive thinking is **off by default** on 4.7 with no `thinking` field — matches the current behaviour. No latency regression expected for the existing analysis/convert/review prompts.

### Behaviour shifts (tune-level, not breaking)

- **More literal instruction following.** `VECTOR_FORGE_SYSTEM_PROMPT` should be reviewed for any "if in doubt" / "default to X" language that previously relied on 4.6's generalising tendency.
- **Verbosity calibrates to task complexity.** Analyses and reviews may run shorter on simple inputs, longer on complex ones.
- **Tools and subagent calls dialled down by default.** Not applicable to IkoniK today (no tool-use, no subagents).

These are tune-level concerns to monitor in the first week post-deploy. None block the bump.

### Reversibility

Single Conventional Commit reverts the eight call sites. No schema or storage migration; Zustand has no persist middleware, so the `ModelOption` type rename does not orphan any user state.

## Verification

`npm run lint && npm run typecheck && npm test && npm run build` — all four must exit 0 before merge. See the `verify-ikonik` skill for the gate.
