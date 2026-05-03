# TBD — open beslissingen tijdens UI redesign

Deze parking spot bevat keuzes die nu pragmatisch zijn opgelost zodat de bouw kon doorgaan.
Staat hier om later met patron afgetikt te worden.

## Defaults gekozen tijdens 2026-05-03 build

| # | Beslissing | Default gekozen | Bron / reden |
|---|---|---|---|
| 1 | Brand-naam top-left logo | **"Agent"** | brief §11: "Pepsi or Agent placeholder". "Agent" past bij de agentic-commerce framing en doet niet alsof Pepsi de brand is. |
| 2 | Cart-pulse amplitude (interne contradictie in vault) | **1.10** | brief §"Choreography volume" + tech-specs animation tokens table say `1.10 (was 1.20, dialed back)`. Brief = newest = wins. Prose secties in vault notes (1.20) zijn outdated. |
| 3 | Read more expansion target | **drawer** (bestaande `ProductDetailDrawer`) | brief §3 "Already in place — Already wired into ProductCard's Meer info link. Use as-is, just relabel". |
| 4 | Font | **Inter blijft** | brief §8 step 14: "If no clear path to Cabinet Grotesk, leave Inter and flag". Cabinet Grotesk niet beschikbaar via @fontsource. |
| 5 | Single-isRecommended enforcement | **client-side filter** (alleen hero krijgt badge) | brief §6.6: "Either is acceptable". Lower-cost en geen prompt-aanpassing. |
| 6 | Cart modal backdrop | `rgba(0,0,0,0.5)` + `backdrop-blur-md` | brief §11 default. Tunen later op aesthetic. |
| 7 | State refactor pad | **extend page.tsx** (geen aparte context) | brief §5: "Either is fine. Lower-cost path." |
| 8 | SSE `status` events | **server emits, frontend negeert** | brief §"Quirks": loader is pure theatre. Server-pad niet aangeraakt. |
| 9 | "Return to home" button | **bestaande Home button + confirm modal blijft**, alleen NL→EN | brief §"Quirks": "reuse, don't duplicate". |
| 10 | `AIThinking.tsx` | **deleted** post-cleanup | brief §15: cleanup. |

## Nog openstaand (niet blokkerend)

- **Cabinet Grotesk swap** — als patron Cabinet Grotesk wil, moet font self-hosted of via `@fontsource-variable/cabinet-grotesk` (niet zeker of dat package bestaat). Snel vervangbaar in `tailwind.config.ts` + `globals.css` `@import`.
- **Search-budget cap** — separate workstream, niet in deze redesign.
- **Tweede productcategorie** — TBD per [[Micha Beekwilder]].
- **Pepsi UI — styling spec** note bestaat nog niet. Huidige tokens (cyan #06B6D4, surface #141414) zijn behouden.
- **ShopAgent reference screenshots** uit cowork sessie 2026-05-03 niet ontvangen — TopBar/Footer stylen op basis van Linear/Vercel/Arc-cue uit de design note.

## Vault contradicties (zie ook brief §1)

- **Cart pulse**: prose in `Pepsi UI — current state description.md` (1.20) en prose in `Pepsi UI — technical specs.md` §"Add-to-cart animation" (1.20) tegenover animation tokens table (1.10). Brief = 1.10. Gekozen: 1.10.
