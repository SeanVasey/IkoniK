# ADR 0002: Add Fable 5 premium tier and bump capable tier from Opus 4.7 to Opus 4.8

- **Status:** Accepted
- **Date:** 2026-06-10

## Context

Anthropic shipped two relevant releases since ADR 0001:

- **Claude Opus 4.8** (`claude-opus-4-8`) — the current Opus-tier model. Same API surface as 4.7 (adaptive thinking only; sampling parameters and `budget_tokens` removed), so a 4.7 → 4.8 move is a pure model-ID swap plus prompt re-tuning. Same pricing as 4.7 ($5/$25 per MTok, 1M context, no long-context premium).
- **Claude Fable 5** (`claude-fable-5`) — a new tier *above* Opus, Anthropic's most intelligent model. Same API surface as Opus 4.7/4.8 with one extra constraint (an explicit `thinking: {type: "disabled"}` returns 400 — IkoniK never sends a `thinking` field, so not applicable). **Pricing is 2× Opus: $10/$50 per MTok.**

IkoniK's model selector previously offered two tiers (Opus capable / Sonnet fast).

## Decision

1. Replace `claude-opus-4-7` with `claude-opus-4-8` everywhere the capable tier is referenced (eight call sites — see the `bump-claude-model` skill).
2. Add `claude-fable-5` as a third, user-selectable premium tier in `MODELS`, all three `ALLOWED_MODELS` allowlists, `MODEL_MAP`, the `ModelOption` store type, and the `ModelSelector` UI.
3. Keep **Opus 4.8 as the default** selection. Fable 5 is opt-in because of its 2× cost.
4. Sonnet 4.6 unchanged as the fast tier.

## Why a pure ID swap/addition is safe for IkoniK

As established in ADR 0001, the IkoniK routes call `callClaude({model, system, maxTokens, messages})` only — no sampling parameters, no `thinking` config, no prefills, no `output_format`. None of the Opus 4.8 or Fable 5 breaking changes apply to this request shape.

## Consequences

### Cost

- Opus 4.7 → 4.8: no per-token price change. Token counting may differ slightly; re-baseline with `count_tokens()` on representative uploads (carried over from ADR 0001's open task).
- Fable 5: **2× Opus pricing.** It is user-selectable, server-allowlisted, and every call is logged per-user via `logUsage`, so spend is attributable. Monitor the usage dashboard after launch; if premium-tier spend becomes a concern, gate Fable 5 behind a role check in the API routes.

### Behaviour shifts (tune-level, not breaking)

- Opus 4.8 narrates more and writes in a warmer voice than 4.7 — irrelevant here since responses are constrained to JSON/SVG by `VECTOR_FORGE_SYSTEM_PROMPT`.
- Fable 5 quality on vision analysis should meet or exceed Opus; no prompt changes required to start.

### Reversibility

Single Conventional Commit reverts all call sites. Zustand has no persist middleware, so the `ModelOption` type change (`'opus-4.7'` → `'opus-4.8'`, plus `'fable-5'`) does not orphan any stored user state.

## Verification

`npm run lint && npm run typecheck && npm test && npm run build` — all four must exit 0 before merge.
