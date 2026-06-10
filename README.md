# Paixão

**Welcome to the Passion Den.** _Pure passion._

Paixão is an exclusive, anonymous, consent-first adult platform — where desire meets discretion. It launches **web-first as an installable PWA** (no app stores) and is currently running a **founding pre-sale funnel** to onboard its first members.

---

## Tech stack

| Layer        | Choice                                                            |
| ------------ | ---------------------------------------------------------------- |
| Framework    | **Next.js 16** (App Router) · **React 19** · TypeScript          |
| Styling      | **Tailwind CSS v4** · Radix UI primitives · Framer Motion        |
| Backend / DB | **Supabase** (Postgres, Auth, RLS, Storage)                      |
| Payments     | **Stripe** (founding pre-sale + subscription tiers)              |
| Crypto       | tweetnacl (anonymous identity / E2E helpers)                     |
| Deploy       | **Vercel**                                                       |

> ⚠️ **This is not the Next.js you may know.** Next 16 / React 19 / Tailwind v4 carry breaking changes from older versions. Before editing, read the bundled guides in `node_modules/next/dist/docs/` (metadata, manifest, opengraph-image, headers). Central brand config lives in `src/config/site.ts` (`siteConfig`) — use it instead of hardcoding brand strings.

### Brand

- Name: **Paixão** · Wordmark: **PAIXÃO**
- Hero: _Welcome to the Passion Den_ · Tagline: _Pure passion._
- Palette: amber `#d4a574` · black `#0a0a0a` · crimson `#c2185b`
- Fonts: Playfair Display (headings) · Inter (body)

---

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example file and fill in values:

```bash
cp .env.example .env.local
```

Keys (see `.env.example` for the full list):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — from `npx supabase start` (local) or the Supabase Cloud dashboard.
- `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME` — app origin + display name.
- `SHORTAPI_KEY` — ShortAPI integration.
- **Founding pre-sale:** `FOUNDING_PRICE_1/2/3` (escalating CAD tiers in cents — CA$39 → CA$139 → CA$499) and `FOUNDING_CURRENCY=cad`. Uses Stripe inline `price_data`, so no pre-created product is needed.
- **Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, plus the subscription price IDs (`STRIPE_PRICE_DESIRE_*`, `STRIPE_PRICE_OBSESSION_*`, `STRIPE_PRICE_PATRON_*`). Use **test keys** (`sk_test_…`, `pk_test_…`) locally.

### 3. Start Supabase + run migrations

```bash
npx supabase start          # boots local Postgres + Auth (prints local keys)
npx supabase db reset       # applies everything in supabase/migrations/
```

Migrations live in `supabase/migrations/` (profiles, events, matchmaking, messaging, consent/safety, admin/notifications, RLS policies, waitlist).

### 4. Stripe webhooks (for payments / founding flow)

```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

Copy the printed `whsec_…` signing secret into `STRIPE_WEBHOOK_SECRET`.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## The founding funnel

The launch strategy is a **founding pre-sale**, not an open signup:

1. **Landing** (`/`) drives visitors to **Claim Founding Access**.
2. **`/founding`** renders live spots-remaining and the current escalating price (`force-dynamic`). Tiers: first **1–100 → CA$39**, **101–200 → CA$139**, **201–300 → CA$499**, then closed.
3. Checkout runs through Stripe (`/api/payments/*`); on success the member lands on **`/founding/thank-you`**.

Founding members lock in lifetime pricing and help shape the room from day one. Pricing logic is in `src/config/founding.ts` + `src/lib/founding/`.

---

## PWA / web-first

Paixão installs straight from the browser — **no app stores**.

- **Manifest:** generated at `src/app/manifest.ts` → served at `/manifest.webmanifest` (standalone display, black background, amber theme).
- **Metadata:** `src/app/layout.tsx` defines production metadata (OpenGraph, Twitter card, robots, theme-color, apple-web-app, icons) sourced from `siteConfig`. Search indexing is **disabled** during the pre-launch campaign (`robots.index = false`) while social unfurls still work.
- **Share images:** branded OG images are generated at build time via `next/og` — `src/app/opengraph-image.tsx` (home) and `src/app/(public)/founding/opengraph-image.tsx` (campaign).

### Required icon assets (add to `/public`)

The manifest and metadata reference PNG icons that **must be added manually** (binary assets can't be generated in-repo):

| File                          | Size      | Purpose            |
| ----------------------------- | --------- | ------------------ |
| `public/icon-192.png`         | 192×192   | standard / apple   |
| `public/icon-512.png`         | 512×512   | standard           |
| `public/icon-maskable-512.png`| 512×512   | maskable (padded)  |
| `public/favicon.ico`          | multi-size| already present    |

Use the PAIXÃO wordmark / amber-on-black mark. Maskable icons need ~10% safe-zone padding so Android doesn't crop them.

---

## Deploy on Vercel

1. Push the repo and **import the project** in Vercel (framework auto-detected as Next.js).
2. Add **all env vars** from `.env.example` in **Project → Settings → Environment Variables** (use **live** Stripe + production Supabase values for Production).
3. Set the **production domain** to match `siteConfig.url` (`paixao.club`) so `metadataBase`, OG URLs, and the manifest resolve correctly.
4. Add the production Stripe webhook endpoint (`https://<domain>/api/payments/webhook`) in the Stripe dashboard and set `STRIPE_WEBHOOK_SECRET`.
5. `vercel.json` pins the function region (`iad1`) and tunes caching for the manifest + OG images.
6. Deploy. Verify the install prompt, share unfurls, and the `/founding` funnel in production.

```bash
npm run build   # production build
npm run lint    # eslint
```

---

## Project structure (high level)

```
src/
  app/
    (public)/        marketing, auth, age-gate, founding funnel
    (authenticated)/ dashboard, matches, messages, events, safety, settings
    (admin)/         admin console
    api/             route handlers (events, matches, messages, payments, safety, admin…)
    layout.tsx       root metadata + fonts
    manifest.ts      PWA manifest
    opengraph-image.tsx
  config/            site.ts (brand), founding.ts
  lib/               supabase clients, founding, crypto, utils
supabase/migrations/ database schema + RLS
```

---

_18+ only. Paixão is intended for adults 18 years of age and older._
