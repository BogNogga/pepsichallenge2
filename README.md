# AI Shopping Assistant — Bluetooth Earbuds Demo

A live-demo web app for sales presentations showing how AI transforms the customer journey. Powered by Claude AI with real-time web search and Stripe test checkout.

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy env file and fill in your keys
cp .env.local.example .env.local

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local` with:

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (must have web search enabled) |
| `STRIPE_SECRET_KEY` | Stripe test secret key (`sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe test publishable key (`pk_test_...`) |
| `NEXT_PUBLIC_APP_URL` | App URL (`http://localhost:3000` for local, your Vercel URL for prod) |

## Demo Flow

1. **Screen 1 — Landing:** User describes what they're looking for (or clicks a suggestion chip)
2. **Screen 2 — Clarify:** AI asks 3–5 clarifying questions to refine the search
3. **Screen 3 — Results:** AI searches the web and presents 3–5 real product recommendations with features, pricing, and rationale
4. **Screen 4 — Checkout:** Stripe test checkout → success page → reset

## Live Presentation Tips

- **Reset the demo:** Click "Start new demo" on the success page, or navigate to `/`
- **Skip clarifying questions:** Click "Skip all" on Screen 2 to go straight to results
- **Stripe test card:** Use `4242 4242 4242 4242` with any future expiry and any CVC
- **Each run is fresh:** No caching — every demo generates new AI results

## Tech Stack

- Next.js 14 (App Router) + TypeScript + React 18
- Tailwind CSS + shadcn/ui + Framer Motion
- Claude API with web search tool
- Stripe Checkout (test mode)

## Deploy to Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

Set environment variables in Vercel dashboard under Settings → Environment Variables.

## Cost

~$0.05–0.10 per demo run (Claude API + web search). Negligible for presentation use.
