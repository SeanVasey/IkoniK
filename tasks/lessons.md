# Lessons Learned

Append entries here after non-trivial debugging sessions. Review at the start of each session.

---

### Patching a vulnerable transitive dependency (postcss inside next)

- **Symptom:** Dependabot flagged `postcss` XSS (GHSA-qx2v-qp2m-jg93). The top-level `postcss` was already patched (8.5.15); the vulnerable copy (8.4.31) was bundled under `node_modules/next/node_modules/postcss`. `npm audit fix --force` wanted to downgrade `next` to 9.3.3 — nonsense.
- **Fix:** Add an npm `overrides` entry (`"postcss": "^8.5.10"`) to dedupe every nested copy to the patched version. Non-breaking (8.4 → 8.5 is a semver-compatible minor). `npm ls postcss` shows `overridden`; `npm audit` goes clean.
- **Gotcha:** I first used the `"$postcss"` reference form (mirror the direct dep). `npm install` accepted it, but `npm update` then aborted with `Unable to resolve reference $postcss`. Use an explicit version range in `overrides` to keep all npm subcommands working.
- **Check next time:** when audit blames a nested dep, confirm where it lives with `npm ls <pkg>` before touching the parent's version. Prefer `overrides` over a major framework bump.
