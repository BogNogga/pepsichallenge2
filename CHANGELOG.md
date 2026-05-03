# Changelog

## 2026-05-03 — Pepsi UI redesign

App language flipped to **English** (was Dutch). 5-screen flow:
Landing → Clarifying questions → Loading + #1 reveal → Product grid → Stripe checkout.
Persistent TopBar + Footer chrome on every screen.
Theatrical beats reserved for the loader → reveal and the cart modal — everything else stays calm.
See `context and notes/TBD.md` for parked decisions and `context and notes/buildbrief1.md` /
`PEPSI_UI_BRIEF.md` for the full spec.

### Added
- **`SearchPhase` enum** in `lib/types.ts`: `landing | clarifying-loading | clarifying-ready | searching | revealing | grid-ready`. Replaces the `screen` enum + the two boolean loading flags in `page.tsx`.
- **TopBar** (`components/chrome/TopBar.tsx`) — brand mark "Agent" + History / Feed / Personalization + Log In + Sign Up. All no-op show chrome. Sign Up swaps for `CartIcon` on `grid-ready`.
- **Footer** (`components/chrome/Footer.tsx`) — copyright + Privacy / Terms / Feedback no-op links.
- **BackgroundGlow** (`components/chrome/BackgroundGlow.tsx`) — single radial cyan glow at canvas center, breathing 7.5s ±10%, mounted once in root layout.
- **Loader theatre** (`components/loader/`):
  - `LoaderScreen` orchestrates the searching + revealing phases.
  - `LoaderSkeleton` — single skeleton card with traveling cyan-dot border (`traveling-border` CSS), shares `layoutId="hero-recommendation"` with the hero card.
  - `ProgressBar` with 95% cap behavior + snap-to-100% on reveal.
  - `StageDialog` + `StageBullet` (states: pending / active / done) + `StageCounter` (ease-out tick).
  - 7 stages, 5 strings each (random pick per run), counter patterns matching the spec table. Strings live in `lib/copy-strings.ts`.
  - Schedule math in `lib/loader-math.ts`: `total = uniform(55, 60)`, per-stage `uniform(8, 16)` normalized.
- **RecommendationReveal** — 7-step choreography: snap progress → fade dialog → fill skeleton → scale-and-settle → typewriter sentence (35 cps) → buttons fade in (Agent checkout, See all options).
- **HeroProductCard** (`components/HeroProductCard.tsx`) — wider hero variant for the recommended product, side-by-side image + content, AI #1 badge, glow-hero treatment. Uses shared `layoutId` so Framer morphs it from reveal position into the grid hero position seamlessly.
- **CartIcon** (`components/cart/CartIcon.tsx`) — `forwardRef`, count badge, listens to `cart-pulse` event for the post-add pulse (scale 1 → 1.10 → 1, 200ms — dialed back from 1.20 per latest brief).
- **CartModal** (`components/cart/CartModal.tsx`) — replaces `CartDrawer`. Centered scale-from-icon (0.6 → 1.0, opacity 0 → 1, 350ms ease-out), `transform-origin` computed from cart icon's bounding rect. Backdrop is `rgba(0,0,0,0.5)` + `backdrop-blur-md`. Dismiss on backdrop click or Esc.
- **FlyToCart** (`components/cart/FlyToCart.tsx`) — portal-mounted helper. `dispatchFlyToCart({ sourceRect, imageUrl })` clones the source image, animates along a curved path to the cart icon over 200ms (scales 1 → 0.2, fades), then dispatches `cart-pulse`. Multiple flights run in parallel.
- **AgentCheckoutTease** (`components/AgentCheckoutTease.tsx`) — small "Coming soon" modal so the Agent checkout dead button never feels broken on stage.
- **Find others** no-op button below the grid.
- **Rotating clarifying loading strings** — 12 strings, typewriter at 40 cps, hold ~4.5s, fade, replace. Shown above the question skeletons during `clarifying-loading`.
- **`use-typewriter`** hook (`lib/use-typewriter.ts`) — shared between loader bullets, reveal sentence, summary, and clarifying loader.
- **`fly-to-cart-event`** event helpers (`lib/fly-to-cart-event.ts`) — `flytocart` and `cart-pulse` CustomEvents, decoupled producer/consumer wiring.
- **Hero card glow** (`globals.css` `.glow-hero`) and traveling-border (`.traveling-border` + `traveling-border-rotate` keyframe).

### Changed
- **All UI strings translated NL → EN.** "Geen voorkeur" → "No preference". "Meer info" → "Read more". "Continue" button on Screen 2 → "Search". Home modal: "Are you sure?" / "You'll lose your current search." / "Cancel" / "Back to home". `metric-descriptions.ts` fully ported to English. `ProductDetailDrawer` headers: Description / Overview / Specifications / Pros & cons / Customer feedback. Pros/cons heuristics also EN.
- **`page.tsx`** rewritten around `SearchPhase`. Frontend ignores `/api/recommend` `status` SSE events — loader runs its own theatre. `result` and `error` events still drive state.
- **`PromptInput`** trimmed: no more suggestion chips. Centered card layout.
- **`ClarifyingQuestions`** polished: rotating loading strings during gen, spring hover/click micro-interactions on answer chips, "Search" CTA replaces "Continue".
- **`ProductGrid`** is now hero + 2-col grid. Brief on-entry skeleton hold (~1.6s), then summary types in (40 cps), hero appears, grid stagger.
- **`ProductCard`** trimmed and re-tuned. `Add to cart` now triggers fly-to-cart via `dispatchFlyToCart`. Hover lift only `y: -2` (calm canvas).
- **Hover scales dialed back to 1.03**, click pulses to 1.05 (was 1.10/1.20). Theatrical beats keep their amplitude.

### Removed
- **`AIThinking.tsx`** — superseded by `LoaderScreen` + `RecommendationReveal`.
- **`CartDrawer.tsx`** — replaced by `CartModal`.
- **Suggestion chips** in `PromptInput` (4 hardcoded chips + the `handleChip` helper).

### Open / parked
- See `context and notes/TBD.md` — picked sensible defaults for brand name ("Agent"), cart pulse amplitude (1.10), font (Inter), single-`isRecommended` enforcement (client-side filter), state refactor approach (extend `page.tsx`). All are easily revisitable.

---

## 2026-04-13

### Added
- **"Geen voorkeur" button** — each clarifying question now has a ghost-style "Geen voorkeur" button. Sends explicit `no_preference: true` to the backend; recommend route filters these out before building the prompt.
- **Home button** — persistent home icon (top-left) on all non-landing screens. Shows confirmation modal when a search or questionnaire is in progress. Resets all client state on confirm.
- **Product detail drawer** — "Meer info" link on each product card opens a side drawer with full description, overview, specs with info tooltips, pros & cons, and customer sentiment. Closes via X, Esc, or backdrop click.
- **Metric info tooltips** — (i) icon next to each spec value in product cards and detail drawer. Hardcoded Dutch descriptions for 17 common earbuds metrics (`lib/metric-descriptions.ts`). Only renders when a description exists for the metric.
- **New components:** `ProductDetailDrawer.tsx`, `MetricInfo.tsx`
- **New data file:** `lib/metric-descriptions.ts` — metric description dictionary with `featureLabelToKey` mapping

### Changed
- **Enhanced loader** (`AIThinking.tsx`) — rotating Dutch status messages (every 2.8s) with fade-in/fade-out transitions, indeterminate progress bar, time estimate ("Dit duurt meestal 10-20 seconden"). Shows backend SSE status events when they arrive, falls back to rotating messages. Extra slow-search message after 30s.
- **`QuestionAnswer` type** — added optional `no_preference` field.
- **Recommend route** — filters out `no_preference` answers before building the user message for Claude.

---

## 2026-04-12 (2)

### Added
- **Product image scraping** — after Claude returns products, scrapes each `sourceUrl` server-side for `og:image` / `twitter:image` meta tags. Fallback chain: og:image → twitter:image → first plausible `<img>` → placeholder SVG. New file: `lib/scrape-image.ts`.
- **"Fetching product images..." status** — SSE status event shown during image scraping so users see progress.

### Changed
- **Recommend system prompt** — Claude now sets `imageUrl: null` instead of attempting to extract image URLs from web search text (reduces hallucinated URLs and saves tokens).

---

## 2026-04-12

### Added
- **Dev logging system** — structured logs for all search queries, AI inputs/outputs. File-based (`logs/*.jsonl`) + in-memory buffer for dev panel.
- **Dev panel UI** (`/dev`) — real-time log viewer with auto-refresh, type/route/search filters, expandable JSON payloads.
- **Dev logs API** (`/api/dev/logs`) — GET with filters, DELETE to clear. Production-guarded.
- **Session linking** — clarify and recommend share a `sessionId` for end-to-end request tracing.
- **CLAUDE.md** — codebase documentation for AI-assisted development.

### Fixed
- **Search results never showing** — stale React closure in `page.tsx` always overwrote real products with fallback data. Replaced state check with local `gotResult` flag.
- **SSE parser failing on large payloads** — old parser couldn't reassemble JSON split across TCP chunks. Rewrote to buffer until double-newline boundary before parsing.
- **Recommend stream crash** — `controller.enqueue()` on already-closed stream threw `ERR_INVALID_STATE`. Added `safeEnqueue`/`safeClose` guards.
- **Claude API timeout** — bumped from 60s to 120s. Web search calls average ~50s, leaving no headroom before.

### Changed
- Logger uses `globalThis` for cross-route buffer sharing (Next.js compiles each route as a separate module).
