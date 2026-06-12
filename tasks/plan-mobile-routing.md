# Plan — Mobile suite redesign + drawer fix + routing restructure

Branch: `claude/ikonik-mobile-routing-snji9w`. Presentation + routing only; the
vectorization pipeline (`src/lib/upload/*`, `src/app/api/*`, vectorForge) is untouched.

## Root cause: dead hamburger

`Header` calls `useAppStore().toggleSidebar`, which flips `sidebarOpen` — but **no
component in the repo renders a sidebar or drawer**. The state is orphaned, and its
default is `true`, so the first tap actually sets it to `false`. Fix: default
`sidebarOpen` to `false` and add a real `NavDrawer` that consumes the state.

## New components (`src/components/layout/`)

- **`Hero.tsx`** — shared hero identity block: `VASEY/AI PRESENTS` eyebrow
  (0.3em tracking, violet tint), IK monogram (`/icons/icon.svg`, existing locked
  asset) beside the IkoniK wordmark (Bebas Neue, accent-gradient K), JetBrains Mono
  version pill reading `version` from `package.json` (resolveJsonModule is on),
  tagline `Claude-powered vector graphics studio.`, low-opacity radial violet glow.
  Pure CSS, no animation that violates reduced motion.
- **`NavDrawer.tsx`** — left slide-in glass drawer driven by `sidebarOpen`:
  focus trap, Esc + backdrop close, body scroll lock, `role="dialog"`
  `aria-modal`, labelled. Auth-aware via Supabase browser client:
  signed out → Home, Sign in; signed in → Home, Studio, Sign out + account email
  in muted JetBrains Mono. Sign out clears session → `/`.
- **`SectionLabel.tsx`** — suite letterspaced-caps label with thin rule
  (`UPLOAD`, `CONVERT`).

## Routing

| Route | Change |
|---|---|
| `/` | New public landing (server component): hero, value statement, 3 feature cards (hybrid tracing, Claude analysis, SVG export), CTA `Sign in to start` → `/login`, or `Enter Studio` → `/studio` when a session exists. Never auto-redirects. |
| `/login` | Moved from `/auth`, OAuth-only: Google / GitHub / Microsoft (`azure`). Email magic-link form removed per spec. Approval gate unchanged (middleware → `/pending`). |
| `/auth` | Thin server redirect → `/login` (URL back-compat). `/auth/callback` stays (configured in Supabase dashboard); now redirects to `/studio` post-exchange — middleware still bounces pending/suspended. |
| `/studio` | Convert experience moves here (page + layout). Protected by middleware: server-side `getUser()`, unauthenticated → `/login`, pending → `/pending`, suspended → `/suspended`. |
| `/convert` | Server redirect → `/studio` (back-compat for bookmarks/PWA). |

Middleware PUBLIC_PATHS: `/` (exact), `/login`, `/auth/callback`, `/pending`,
`/suspended`. `/auth` stays protected-exempt via its own redirect page being
public. Unauthed default redirect changes `/auth` → `/login`. No session
lifetime changes. Manifest `start_url` is already `/` — now lands on the
landing page (PWA intact, no manifest change needed).

Sign-out destinations across Header / drawer / pending / suspended → `/`.

## Restyle (mobile-first, tokens only — `#7C5CFC` single accent)

- **Studio page**: Hero at top; `UPLOAD` / `CONVERT` section labels; glass
  DropZone (glowing accent glyph, `DRAG & DROP IMAGE` Bebas headline,
  `or tap to browse`, JetBrains Mono format chips `PNG JPEG WEBP GIF`);
  drag-active = accent border + glow. Convert card: solid accent
  `Analyze Image`, outlined accent `Convert to SVG`, `min-h-[52px]` touch
  targets, `active:` pressed states, full-width on mobile.
- **Header**: visible Sign out (fetches user via Supabase client on mount).
- **Footer**: suite template kept; optical monogram sizing corrected (the V/AI
  glyph carries internal padding in its 1080 viewBox so it renders larger than
  the VM mark at equal box size) + spacing/typography pass.
- **Global**: `prefers-reduced-motion: reduce` kills animations/transitions;
  `MotionConfig reducedMotion="user"` around framer-motion trees.

## Tests / docs

- Update `tests/stores.test.ts` (sidebar default now `false`).
- Add `tests/navDrawer.test.tsx` regression test (drawer renders when open,
  closes on Esc).
- README routing/screens section + CHANGELOG entry.

## No new dependencies

Focus trap, scroll lock, drawer animation are small enough to hand-roll with
React + CSS transitions; framer-motion is already present for the rest.

## Verification

`npm run lint && npm run typecheck && npm test && npm run build`, then dev
server with placeholder Supabase env to exercise `/` → `/login` → middleware
redirects (no real Supabase project is available in this environment, so the
OAuth + approval legs are verified by code path + middleware behavior, and
reported as such).
