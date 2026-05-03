# Pepsi Challenge AI Shopping Assistant

## Overview

AI-powered Bluetooth earbuds shopping assistant. Users describe what they want, an AI (Claude) asks clarifying questions, searches the web for real products, and presents structured recommendations. Users can add products to a cart and check out via Stripe (test mode).

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.7 (strict mode)
- **UI:** React 18, Tailwind CSS 3.4, shadcn/ui, Framer Motion
- **AI:** Anthropic Claude SDK (`@anthropic-ai/sdk`), model `claude-sonnet-4-6` with web search tool
- **Payments:** Stripe (test mode)
- **Package Manager:** pnpm

## Project Structure

Standard Next.js layout — source lives at the repo root (no inner wrapper directory). This makes Vercel's default detection work without setting a Root Directory.

```
.
├── app/                       # Next.js App Router
│   ├── page.tsx               # Main client component — orchestrates 3 screens
│   ├── layout.tsx             # Root layout with CartProvider + Toaster
│   ├── globals.css
│   ├── success/page.tsx       # Stripe success confirmation
│   ├── dev/page.tsx           # Dev panel — log viewer UI
│   └── api/
│       ├── clarify/route.ts            # POST: generates clarifying questions via Claude
│       ├── recommend/route.ts          # POST: web search + product recommendations (SSE stream)
│       ├── create-checkout-session/route.ts  # POST: Stripe checkout
│       └── dev/logs/route.ts           # GET/DELETE: dev log API
├── components/                # UI components (PromptInput, ProductCard, ProductDetailDrawer,
│                              # HeroProductCard, ClarifyingQuestions, ProductGrid, MetricInfo,
│                              # PlaceholderImage, AgentCheckoutTease, cart/, chrome/, loader/, ui/)
├── lib/                       # anthropic, stripe, cart-context, types, fallbacks, id, utils,
│                              # metric-descriptions, copy-strings, fly-to-cart-event, logger,
│                              # logger-types, loader-math, mock-data, mock-pipeline, scrape-image,
│                              # serpapi-image, use-typewriter
├── public/                    # Static assets
├── package.json               # next 14, react 18, tailwind 3.4, framer-motion, anthropic-ai/sdk, stripe
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## Key Flows

1. **Search → Clarify:** User enters query → `POST /api/clarify` → Claude generates 3-5 questions using `generate_questions` tool
2. **Clarify → Recommend:** User answers questions (or marks "Geen voorkeur") → `POST /api/recommend` → backend filters out `no_preference` answers → Claude uses web_search (up to 5 times) → returns structured products via SSE stream
3. **Cart → Checkout:** User adds products to cart → `POST /api/create-checkout-session` → redirect to Stripe
4. **Home reset:** Home button (top-left) → confirmation modal if work in progress → resets all client state to landing

## Development

```bash
pnpm install
pnpm dev          # starts on http://localhost:3000
```

Required env vars (see `.env.local.example`):
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## Dev Panel & Logging

- Visit `/dev` for the log viewer UI
- Logs are written to `logs/*.jsonl` files (one per day)
- Logged: search queries, AI inputs, AI outputs
- NOT logged: cart operations, Stripe checkout
- Dev logs API: `GET /api/dev/logs` (with query filters), `DELETE /api/dev/logs` to clear
- Production-guarded: dev endpoints return 404 in production

## Conventions

- All interactive components use `"use client"` directive
- API routes use Next.js App Router convention (`route.ts` with exported HTTP method functions)
- Claude tool_use pattern for structured outputs (forced tool choice)
- SSE streaming for the recommend endpoint (multi-turn web search loop)
- Dark theme throughout (Tailwind CSS variables in `globals.css`)
- Error handling: single retry → fallback data → toast notification
- Imports use `@/` path alias mapped to `app/`
