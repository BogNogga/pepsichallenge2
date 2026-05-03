# Pepsi UI — dev brief for Claude Code

**Owner:** patron
**Date:** 2026-05-03
**Audience:** Claude Code, picking up the `pepsichallenge2` codebase to implement the UI redesign.

This brief describes a redesign of the existing Pepsi demo. The good news: the architecture, backend, and theme are already very close to the target spec. The work is mostly front-end refactor + new choreography components, not a rewrite. Read this end to end before writing code.

---

## 1. Source of truth (read first)

Two design notes in patron's Obsidian vault are the single source of truth. **Read them both before starting:**

- **Design direction (what each screen *is*):**
  `C:\Users\mjwbe\OneDrive\Documenten\Claude vault\Projects\Agentic Commerce\Project Pepsi\Pepsi UI — current state description.md`
- **Technical specs (how each screen *behaves* — math, lists, tables):**
  `C:\Users\mjwbe\OneDrive\Documenten\Claude vault\Projects\Agentic Commerce\Project Pepsi\Pepsi UI — technical specs.md`

Supporting context:

- Project status: `C:\Users\mjwbe\OneDrive\Documenten\Claude vault\Projects\Agentic Commerce\Project Pepsi\Project Pepsi overview.md`
- Earlier feature specs: `C:\Users\mjwbe\OneDrive\Documenten\Claude vault\Projects\Agentic Commerce\Project Pepsi\Pepsi run 1 — feature specs.md`
- Backend SSE pipeline notes: `C:\Users\mjwbe\OneDrive\Documenten\Claude vault\Projects\Agentic Commerce\Project Pepsi\Pepsi search mechanism.md`

If anything in this brief contradicts those notes, the notes win. Flag the contradiction.

---

## 2. Goal in one paragraph

A live sales-demo web app for one product scenario (Bluetooth earbuds). The user types a prompt, the AI asks clarifying questions, then the app plays a theatrical 60-second loader while the real backend search runs, then reveals a #1 recommendation followed by a full grid. Ends with Stripe test-mode checkout. The whole point is the audience saying "shopping isn't like this anymore" — visual polish and choreography matter more than feature breadth. Demo-only: no auth, no persistence, no production concerns.

---

## 3. Codebase orientation

Codebase root: `C:\Users\mjwbe\OneDrive\1. Projecten\agentic commerce\pepsichallenge2\`

Source under `app/`. Stack: Next.js 14 App Router, React 18, TypeScript 5.7 strict, Tailwind 3.4, shadcn/ui (button, badge, tooltip), Framer Motion v12, Anthropic SDK v0.88 with **`claude-sonnet-4-6`** + **`web_search_20250305`** already wired, Stripe v22 test mode, Sonner toaster, pnpm.

### Already in place — do not reinvent

- **3-screen orchestrator** at `app/app/page.tsx` with `screen: "landing" | "clarifying" | "results"`. Local state for `query`, `questions`, `clarifyLoading`, `sessionId`, `products`, `summary`, `streamedSummary`, `recommendLoading`, `statusMessage`, `cartOpen`, `showHomeConfirm`. Already wraps screens in Framer Motion `<AnimatePresence mode="wait">` with a fade + x-slide page transition.
- **`/api/clarify`** — `POST { query } → { questions, sessionId }`. Forced Claude tool_use on `generate_questions`. Logs everything via the dev logger. Done.
- **`/api/recommend`** — `POST { query, answers, sessionId? }` returns **SSE stream** with three event types: `status`, `result`, `error`. `result` payload is `{ summary, recommendations: LiveProduct[] }`. Multi-turn loop with `web_search_20250305` (max_uses 5) + a forced `provide_recommendations` tool. SerpAPI image fallback already in place. Done.
- **`/api/create-checkout-session`** — Stripe checkout, success → `/success`, cancel → `/?screen=results`. Done.
- **`/success` page** — confirmation + reset button. Done (minor copy tweaks may be needed).
- **`/dev` page + `/api/dev/logs`** — log viewer, gated to non-production. Don't touch.
- **`CartProvider`** at `app/lib/cart-context.tsx` — `useReducer`, in-memory only, items keyed by `product.id`. Exposes `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `totalItems`, `totalPrice`. Use as-is.
- **Theme** — `<html className="dark">`, `bg-background = #0A0A0A`, `surface = #141414`, `accent = #06B6D4` (cyan), text and border tokens already in `tailwind.config.ts`. Inter font already loaded. CSS keyframes for `shimmer`, `fade-in`, `glow` already there.
- **Framer Motion** — used throughout: `PromptInput`, `ClarifyingQuestions`, `ProductGrid`, `ProductCard`, `ProductDetailDrawer`, `CartDrawer`, `AIThinking`, `success/page.tsx`, `page.tsx`. Containers use stagger + item fade-y patterns. Cart drawer uses spring transitions.
- **`MetricInfo`** — small (i) icon → Radix tooltip with metric explanation. Already wired into `ProductCard`'s feature table.
- **`ProductDetailDrawer`** — right-slide drawer with description, rationale, full specs, pros/cons parsed from sentiment. Triggered by "Meer info" link on each card. Use as the "Read more" expansion target — just relabel the trigger to English.
- **`PlaceholderImage`** — SVG earbud silhouette on teal-cyan gradient. Use for null `imageUrl` cases.
- **Types** at `app/lib/types.ts`: `LiveProduct` (with `isRecommended: boolean`, `recommendationReason: string | null`), `ProductFeatures`, `ClarifyingQuestion`, `QuestionAnswer`, `RecommendResponse`, `AppScreen`. Use as-is.

### Mostly there but needs work

- **`PromptInput.tsx`** — Auto-height textarea + 4 suggestion chips + submit button. **Remove the chips entirely** (recent decision) — patron does not want pre-determined suggestions. Keep the rest.
- **`ClarifyingQuestions.tsx`** — Already renders questions + options + per-question "Geen voorkeur" toggle + skip-all + continue. Translate Dutch labels to English ("Geen voorkeur" → "No preference", any other Dutch).
- **`ProductGrid.tsx`** — Currently 1/2/3 col responsive grid with `AIThinking` for the loading state, an `<AIThinking>` block that streams `streamedSummary`, then product cards. Replace the loading state and switch to **hero + 2-column grid**.
- **`ProductCard.tsx`** — Image, title/brand, price, feature table, rationale, "Meer info" link, Add to cart button. Currently 5-row feature table with `MetricInfo` icons (good — keep). Has an "AI Recommended" badge (`glow-accent`) when `isRecommended`. Add a **hero variant** that uses Framer Motion `layoutId` so the card can morph from the #1 reveal screen into the grid hero position. Relabel "Meer info" → "Read more" — app is English.
- **`CartDrawer.tsx`** — Right-slide drawer. **Refactor to a centered scale-from-icon modal** per the new spec. Same contents (items list, qty controls, total, checkout, clear). New animation: 350ms ease-out, scale 0.6 → 1.0, opacity 0 → 1.0, transform-origin = cart-icon center.
- **`AIThinking.tsx`** — 3 pulsing dots + rotating Dutch messages + indeterminate progress bar + slow warning >30s. **Replace this entirely** with the new 7-stage loader theatre. Don't try to retrofit it; the choreography is fundamentally different.

### Missing entirely — must build

- **TopBar** (top-bar chrome with brand mark, History / Feed / Personalization, Log In, Sign Up). All no-op. On Screen 4 only, Sign Up is replaced in-place by the cart icon.
- **Footer** (Privacy / Terms / Feedback links + copyright). All no-op.
- **BackgroundGlow** — single subtle radial cyan glow at canvas center, breathing 6–9s ±10% opacity. Mounted once in the root layout.
- **LoaderScreen** + sub-components for the 7-stage theatre (see §6).
- **RecommendationReveal** — the #1 reveal phase between loader and grid.
- **CartIcon** — top-right slot, replaces Sign Up on Screen 4. Forwards a ref so the cart-modal animation can target its bounding rect.
- **CartModal** — replaces `CartDrawer` (centered scale-from-icon).
- **FlyToCart** — clone product image, animate along bezier curve to cart icon, then cart pulse.
- **"Find others" button** below the grid — no-op show element.
- **"Agent checkout" tease modal** — small "Coming soon — agent completes the purchase autonomously" modal so the dead button never feels broken on stage.

### Quirks worth knowing

- **Frontend ignores backend `status` events on the loader.** The new spec says explicitly: the loader's bullets, counters, and progress are **pure frontend theatre**, decoupled from backend `/api/recommend` SSE `status` events. Today the `AIThinking` component swaps in backend messages and holds them for 3 seconds. **Stop doing this.** The loader plays its own pre-written script and ignores backend status. The only signal the loader cares about is "did `result` arrive yet?". This is a deliberate design choice for demo determinism.
- **`AnimatePresence mode="wait"`** is already in place for screen transitions — use the existing pattern, don't reinvent.
- **Home confirmation modal** already exists in `page.tsx` (`showHomeConfirm`) — reuse, don't duplicate.
- **Item id field** is `product.id` (UUID assigned in the recommend route). Cart state keys off it. Don't change.
- **Currency** is per-product (`product.currency`) — Stripe checkout uses it lowercase. Leave alone.
- **`/api/products`** does **not** exist in this codebase (different from the older `AgenticCommerceUC1` codebase). Don't look for it.

---

## 4. Target state — what we're shipping

Read the vault notes for full detail. The shape:

**Screens (5, all SPA except `/success`):**

1. **Landing** — centered card with title, subtitle, prompt input, "Find products" CTA. **No suggestion chips.**
2. **Clarifying questions** — header with user's quoted prompt, 3–5 question cards, per-question single-select answer boxes with a "No preference" option, "Skip all" link, "Search" button. While questions generate, rotating typewriter status strings appear above the skeletons.
3. **Loading + #1 reveal** — single skeleton card center-top with traveling cyan-dot border, progress bar (~2/3 width), 7-bullet stage dialog with active-state typewriter and per-stage counter. Total fake schedule: random `uniform(55, 60)` seconds. When real data arrives **and** schedule done, snap to 100%, fill skeleton with the recommended product, scale-and-settle the card, typewriter the reveal sentence, surface "Agent checkout" + "See all options" buttons.
4. **Product grid** — hero card (the same React node from Screen 3b, repositioned via Framer Motion `layoutId`) above a 2-column grid of the rest. Each card: image, name, brand, price, feature table with info-icon popovers, short description, "Read more" expansion, "Add to cart". "Find others" no-op button below the grid. Cart icon top-right.
5. **Stripe Checkout (hosted)** — existing. Success → `/success`. Cancel → back to grid (cart preserved via existing `?screen=results` URL trick).

**Persistent chrome on every screen:**

- Top bar (new): brand mark (top-left, no-op), three menu items (History / Feed / Personalization, all no-op), Log In link (no-op), Sign Up CTA (no-op). **On Screen 4 only**, Sign Up swaps for `CartIcon`.
- Footer (new): copyright on left, Privacy / Terms / Feedback no-op links on right.

**Cart modal:** triggered by cart icon. Centered scale-from-icon. 350ms ease-out. Backdrop dim + blur. Items list, total, "Checkout to Stripe" CTA.

**Add-to-cart animation:** clone product image → bezier path to cart icon → scale 1→0.2 + fade over 200ms → cart icon pulses scale 1→1.10→1 over 200ms.

**Aesthetic:** dark + cyan + minimalist + clean SaaS feel. Linear / Vercel / Arc territory. Solid dark cards with thin low-opacity borders — **not liquid glass**. The earlier liquid-glass / heavy-glow / jellyfish exploration is retired. The current `glow-accent` utility is fine for the hero card — keep it subtle.

**Choreography volume:** calm canvas, theatrical at two beats only — the loader → #1 reveal, and the cart modal expansion. Everything else stays gentle. Existing animations may need amplitude dialed back. Click pulse should be scale 1→1.05 (not the larger 1.20 the older specs used). Hover scale 1→1.03.

---

## 5. State machine refactor

Replace the current `screen` enum and the two boolean flags with a single richer phase:

```ts
type SearchPhase =
  | 'landing'                 // Screen 1
  | 'clarifying-loading'      // Screen 2 with skeleton + LLM in flight
  | 'clarifying-ready'        // Screen 2 with questions visible
  | 'searching'               // Screen 3a — fake loader running
  | 'revealing'               // Screen 3b — #1 card scale-and-settle
  | 'grid-ready';             // Screen 4
```

Two acceptable approaches:

- Add `app/lib/search-phase-context.tsx` (Context + reducer). Wrap the app, then `app/app/page.tsx` reads `phase` and routes to the right screen.
- Or extend `page.tsx`'s existing local state — collapse `screen` + `clarifyLoading` + `recommendLoading` into a single `phase` value. Lower-cost path.

Either is fine. Pick one and proceed. `page.tsx` becomes a thin router: pick which screen component to render based on `phase`, wrap the switch in the existing `<AnimatePresence mode="wait">`.

**The hero card identity is shared across `revealing` and `grid-ready`.** This is non-negotiable. The recommended product card in `RecommendationReveal` and the hero card in the grid are the **same React component instance** with a stable `layoutId` (e.g. `"hero-recommendation"`). Framer Motion handles the morph automatically when the screen switches. Get this right and the demo's "settles into place" beat works for free; get it wrong and it looks janky.

**Backend integration into the new phases:**
- `landing → clarifying-loading` on prompt submit. Hit `/api/clarify`. On response, `clarifying-loading → clarifying-ready`.
- `clarifying-ready → searching` on Search click. Hit `/api/recommend` SSE. **Frontend ignores `status` events.** The loader plays its own schedule.
- `searching → revealing` when both: (a) `result` event has arrived, AND (b) the fake schedule has finished its full duration (or the cap holds at 95% if real data is late — see §6.3).
- `revealing → grid-ready` on "See all options" click.

---

## 6. Loader theatre — the centerpiece

Build this carefully. It's the demo's single biggest moment.

### 6.1 Sub-components

Suggested files (under `app/components/loader/`):

- `LoaderScreen.tsx` — top-level container. Owns the schedule + phase transition logic.
- `LoaderSkeleton.tsx` — single skeleton product card with traveling cyan-dot border. Pure CSS keyframe animation, ~3s perimeter loop.
- `ProgressBar.tsx` — bar with smooth fill driven by elapsed time. Supports the 95% hold + snap-to-100% behavior.
- `StageDialog.tsx` — vertical list of 7 `StageBullet`s.
- `StageBullet.tsx` — props: `state: 'pending' | 'active' | 'done'`, `label`, `statusString`, `counter`. Active state runs typewriter at **50 cps**.
- `StageCounter.tsx` — ticks the number(s) toward target with ease-out within the stage's duration.
- `RecommendationReveal.tsx` — manages the 7-step reveal choreography (snap progress → fade dialog → fill skeleton → scale-and-settle → typewriter sentence → surface buttons).

### 6.2 Stage duration math

Randomize at the start of each `searching` phase so multiple demos feel different:

```ts
const total = 55 + Math.random() * 5;                            // uniform(55, 60)
const raw = Array.from({length: 7}, () => 8 + Math.random() * 8); // uniform(8, 16)
const scale = total / raw.reduce((a, b) => a + b, 0);
const stageDurations = raw.map(d => d * scale);                   // sums to `total`
```

Place this in `app/lib/loader-math.ts` along with helpers for `progressForElapsed()` etc.

### 6.3 Cap behavior

- Real data arrives **before** schedule done → finish current bullet's typewriter + counter, snap progress to 100%, start reveal.
- Real data arrives **after** schedule done → progress holds at **95%**, active bullet stays active. As soon as data arrives, snap to 100% and reveal.

Progress bar must never exceed `(elapsed / total) * 0.95` while still waiting on real data.

### 6.4 Copy strings — copy verbatim from the technical specs note

Place in `app/lib/copy-strings.ts`:

- 12 clarifying-load strings (Screen 2, while `/api/clarify` runs).
- 35 stage strings (5 per stage × 7 stages).
- 7 counter pattern functions, e.g. `(elapsedRatio) => "Ranked " + Math.round(elapsedRatio * 12) + " of 12 candidates"`.

**Translate any existing Dutch placeholders.** App language is English.

### 6.5 Reveal sequence (RecommendationReveal)

When triggered (real data arrived AND schedule done):

1. Progress bar snaps to 100% over 250ms.
2. Bullets + counter fade out over 250ms (concurrent with step 1).
3. Skeleton card content fills in (image, name, brand, price). Accent border treatment intensifies. Total morph: 300ms.
4. Card begins scale-and-settle: scale 1.00 → 1.05, translateY 0 → +20px, 400ms ease-out.
5. Reveal sentence types in above the card at **35 cps**: `${product.name} is the #1 choice based on your preferences`.
6. Once typing finishes, the two buttons fade and rise into place (350ms, AnimatePresence).
7. The Reveal card is the same React instance the grid hero will become — uses `layoutId="hero-recommendation"` (or similar stable id).

Total reveal time: ~1.4–1.8s depending on product-name length.

### 6.6 Picking the recommended product

The current `/api/recommend` returns `recommendations` with up to 2 having `isRecommended: true`. For the #1 reveal, pick the **first** product with `isRecommended: true`. If none, pick `recommendations[0]`. The other items go into the 2-col grid contents.

If the spec wants exactly one #1 (it does — only the hero gets the "AI #1" badge), update the recommend route's prompt to enforce single-recommendation, OR ignore the second `isRecommended` flag client-side and only badge the hero. Either is acceptable.

---

## 7. Cart refactor

### 7.1 CartIcon (new)

`app/components/cart/CartIcon.tsx`. Top-right slot on Screen 4 only. Replaces the Sign Up button **in the same anchor position**. Shows count badge when `totalItems > 0`. Forwards a ref so:
- The cart-modal scale-from-icon animation can read its bounding rect.
- The fly-to-cart animation can use it as an end target.

### 7.2 CartModal (refactor `CartDrawer`)

`app/components/cart/CartModal.tsx`. Replace the right-slide drawer with a centered scale-from-icon modal:
- Backdrop: `rgba(0,0,0,0.5)` + `backdrop-blur-md` (use sensible defaults, flag for tuning).
- Modal: ~50% viewport width, centered, scale 0.6 → 1.0 + opacity 0 → 1.0 over 350ms ease-out, transform-origin = cart-icon center.
- Close: 250ms ease-in inverse. Dismiss on backdrop click.
- Same internal contents as `CartDrawer`: header with item count, items list with thumb/name/qty/price, total, "Checkout to Stripe" CTA.

You can keep `CartDrawer.tsx` for reference until `CartModal` is wired up, then delete it.

### 7.3 FlyToCart (new)

`app/components/cart/FlyToCart.tsx`. Portal-mounted helper that:
1. Clones the source DOM rect (the product image clicked).
2. Animates a positioned `<div>` along a quadratic bezier from source center to cart-icon center.
3. Scales 1.0 → 0.2, fades opacity 1.0 → 0.0, total 200ms ease-in.
4. Removes itself on arrival.
5. Fires a global event so the cart icon can pulse (scale 1.00 → 1.10 → 1.00 over 200ms).

Wire it via the Add-to-cart handler in `ProductCard.tsx` — when the user clicks Add, capture the rect of the card's image element, dispatch a `CustomEvent('flytocart', { detail: { sourceRect } })`, and `FlyToCart` (mounted once at app root) listens and triggers.

Multiple add-to-cart actions should be able to fire in parallel (each spawns its own clone). Cart pulse retriggers from scale 1.00 each time (no compound stacking).

---

## 8. Implementation order

Build in this order. Each phase is testable on its own.

1. **Foundation.** TopBar, Footer, BackgroundGlow. Wire into `app/app/layout.tsx`. Verify they render around the existing pages without breaking the current flow.
2. **Phase enum.** Refactor `page.tsx` from `screen` + booleans to the 6-value `searchPhase` enum. Keep all current behavior. Add a debug control (dev-only) to flip phases manually.
3. **Landing trim.** Remove suggestion chips from `PromptInput.tsx`. Keep the rest.
4. **Clarifying polish.** Translate Dutch labels in `ClarifyingQuestions.tsx`. Add the rotating loading strings during `clarifying-loading` phase (12 strings, typewriter at 40 cps, hold 3–5s, fade, replace).
5. **Loader theatre.** Build `LoaderScreen` + sub-components. Implement `loader-math.ts` and `copy-strings.ts`. Test with a hardcoded `setTimeout` to fake "data arrived". Verify counter ticks, bullet flips, progress fills, cap behavior.
6. **Reveal.** Build `RecommendationReveal`. Hook up the 7-step choreography. Wire `layoutId` on the card. Test with fake recommendation data.
7. **Wire to backend.** Connect the loader to `/api/recommend` SSE — but **only** listen for `result` and `error`, not `status`. The loader's own schedule runs in parallel. Confirm `searching → revealing → grid-ready` transitions work with real data.
8. **Grid layout.** Update `ProductGrid.tsx` to render hero + 2-col grid. Add hero variant to `ProductCard.tsx` with the same `layoutId` from the reveal. Verify the morph from reveal to grid is smooth.
9. **Find others.** Add no-op "Find others" button below the grid (visual click pulse only).
10. **Cart.** Build `CartIcon`. Refactor `CartDrawer` → `CartModal`. Verify scale-from-icon animation. Wire the cart icon into the TopBar's right slot on Screen 4 only (Sign Up swap).
11. **FlyToCart.** Build the cloned-image fly animation + cart pulse. Wire into the Add-to-cart handler.
12. **Dead buttons.** Top-bar items (no-op with hover state). Footer links (no-op). Brand logo (visual click pulse only). "Agent checkout" tease modal. "Find others" click pulse.
13. **Amplitude tuning.** Walk every existing animation and dial volume down: hover scales to 1.03 (not 1.10+), click pulses to 1.05 (not 1.20), screen transitions stay at 400ms but the slide distance can be reduced. The two theatrical beats (loader → reveal, cart modal open) keep their full amplitude.
14. **Font.** If you have a clear path to a geometric sans (Cabinet Grotesk via `@fontsource-variable/...` or self-host), swap. If not, leave Inter and flag for patron.
15. **Cleanup.** Delete `AIThinking.tsx` and any other now-unused components. Remove suggestion-chip dead code from `PromptInput`. Translate any leftover Dutch strings (`"Meer info"` → `"Read more"`, `"Geen voorkeur"` → `"No preference"`, `AIThinking` Dutch messages — but those go away with the component).

---

## 9. Constraints

- **Desktop only.** Primary 1920×1080. Don't waste time on mobile.
- **No localStorage / sessionStorage.** All state in-memory (cart context already complies).
- **No `prefers-reduced-motion` handling.** Out of scope.
- **No auth, no persistence, no DB.**
- **All show chrome must be no-op.** Top-bar items, footer links, Agent checkout, Find others, brand logo — all visible, all dead.
- **Stripe stays test mode, hosted Checkout.** No custom checkout UI.
- **Frontend ignores backend `status` SSE events.** The loader is pure theatre.
- **The hero card is one React instance** shared across `revealing` and `grid-ready` via `layoutId`. Don't re-mount.

---

## 10. Out of scope

- Final styling tokens (palette hex values, exact type scale, exact button recipe). The existing dark + cyan tokens in `tailwind.config.ts` and `globals.css` are a good starting point — patron will produce a `Pepsi UI — styling spec` note later if exact values need locking. Until then, use the current tokens and only tweak when the choreography demands it.
- Second product category beyond Bluetooth earbuds.
- Search budget cap (separate workstream — search currently costs ~$10 over a sales meeting).

---

## 11. Open decisions to flag, not invent

If you hit one of these and the vault notes don't resolve it, ask patron rather than guess:

- Brand name for the top-left logo. Default: "Pepsi" or "Agent" placeholder.
- Cart modal exact backdrop dim/blur values. Defaults: `rgba(0,0,0,0.5)` + `backdrop-blur-md`.
- Final font choice (geometric sans). Default: keep Inter.
- "Return to home" button placement and behavior — already partially exists as `showHomeConfirm`; flag if you change it.
- Whether to enforce single-`isRecommended` in the recommend prompt, or filter client-side. Either is fine.

---

## 12. Definition of done

- All 5 phases reachable via the natural flow (Landing → Clarifying → Loading + Reveal → Grid → Stripe).
- Loader plays the 60s choreography with random stage durations, 7 stages, counter ticks, typewriter at 40 / 35 / 50 cps, cap behavior correct (95% hold if real data is late).
- Hero card visibly morphs from #1 reveal position into the grid hero position (same React instance, `layoutId` working).
- Cart modal scales from cart icon and dismisses back into it.
- Add-to-cart fires the fly-to-cart clone + cart pulse.
- All dead-button handlers wired and don't break anything when clicked.
- Stripe test checkout completes end-to-end with cart preserved on cancel and reset on success.
- Top bar + footer render on every screen without functional clicks.
- No console errors on a clean run-through.
- Total search-to-grid time perceived at ≈ 60 seconds regardless of real backend latency.
- All Dutch strings translated to English.

When done, post a short summary to patron with: any decisions you flagged, any vault-note contradictions, and any leftover technical debt from the old `AIThinking` / `CartDrawer` deletion.
