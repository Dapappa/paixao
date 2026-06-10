# Paixão — Handoff / Working Doc

Pick-up guide for continuing on another machine (Mac/PC). Last updated 2026-06-09.

> **Paixão** — an exclusive, anonymous, consent-first **18+ adult** dating + events platform. Brand: "five-star lounge at midnight." Web-first / installable PWA (no app store). Alberta-first launch via a founding pre-sale funnel.

---

## 1. Run it locally

```bash
npm install
# create .env.local (see §2) — it is gitignored, so it does NOT travel with the repo
npm run dev          # http://localhost:3000
```

Stack: **Next.js 16** (App Router, Turbopack) · **React 19** · **Tailwind v4** · **motion/react** · **Supabase** · **Stripe** · **Phosphor icons**.

> ⚠️ This is a *modified* Next 16 — read `node_modules/next/dist/docs/` before changing framework behavior (see `AGENTS.md`). Notably: `ssr:false` is forbidden in Server Components; `viewTransition` lives under `experimental`.

---

## 2. Environment (`.env.local` — recreate on each machine)

`.env.local` is **not** committed (secrets). Copy `.env.example` and fill in:

| Var | What | Notes |
|-----|------|-------|
| `SHORTAPI_KEY` | AI asset generation (the `ak-...` key) | Required for `scripts/generate-*`. |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Currently placeholders — app runs, but auth/data are gated (see §6). |
| `STRIPE_SECRET_KEY` / `_WEBHOOK_SECRET` / `NEXT_PUBLIC_..._PUBLISHABLE_KEY` | Stripe (SFW founding funnel only) | Placeholders today. |
| `STRIPE_PRICE_*` | Subscription price IDs | Placeholders. |
| `PREVIEW_AUTH` | **Dev-only** — set `=1` to walk the authenticated app with no login | **Remove before launch** (see §6). |

---

## 3. Design system — "Velvet Aura"

- **Palette:** near-black `#0a0a0a` + amber/brass `#d4a574` + crimson `#c2185b`.
- **Type:** Playfair Display (display, `font-serif`) + Hanken Grotesk (body, `font-sans`). Inter was intentionally dropped.
- **Motion:** `src/lib/motion.ts` (named easings, `silk`/`allure` springs, `riseIn`/`stagger`/`bloom` variants). Use `motion/react` via `<LazyMotion features={domAnimation}>` + `m.*`.
- **Icons:** **Phosphor** — `import { X } from "@phosphor-icons/react/ssr"`. Convention: `weight="light"` default, `"fill"` active, `"duotone"` hero/empty-state, `"bold"` carets. (shadcn `ui/` primitives still use lucide — leave them.)
- **Atmosphere utilities** (`src/app/globals.css`): `aura-field`, `animate-aura-drift`, `animate-breath`, `film-grain`, `vignette`, `text-gradient-brand/gold`.

---

## 4. AI asset pipeline (`scripts/`)

All imagery is generated via **SHORTAPI** (https://shortapi.ai) and stored in `public/generated/` as optimized `.webp`.

```bash
# 1. edit scripts/asset-jobs.json  (array of { name, model, args })
node scripts/generate-assets.mjs            # generate all (or pass name filters)
node scripts/optimize-assets.mjs            # 4K PNG -> webp + deletes the heavy png (ALWAYS run after)
node scripts/generate-video.mjs vid-hero-aura   # image->video loop (Veo 3.1)
node scripts/fix-asset-refs.mjs             # repoint /generated/*.png -> .webp across src
```

**SHORTAPI quick facts** (verified): base `https://api.shortapi.ai`, `Bearer` auth, async jobs — `POST /api/v1/job/create {model,args}` → `{code:0,data:{job_id}}`; poll `GET /api/v1/job/query?id=` → `status` **2 = done**, results at `data.result.images[].url` (URLs are ephemeral → download). Client: `src/lib/ai/shortapi.ts`.

**Model choice by tier (important):**
- **SFW / hero stills** → `google/nano-banana-pro/text-to-image` (gorgeous, but *strict* moderation).
- **Sensual / boudoir (Tier-1)** → `shortapi/flux-1.0/text-to-image` — more tolerant of tasteful M-rated content *with safety on*. Don't disable `safety_checker`.
- **Persona / dating photos** → **authentic amateur** prompt style (Flux): *"candid amateur phone photo / mirror selfie, real lived-in bedroom, warm lamp + fairy lights, unposed, grainy iPhone night photo, no studio, no retouching."* This reads REAL; editorial/studio prompts read fake.
- **Video loops** → `google/veo-3.1/image-to-video`.

---

## 5. Content tiers + NSFW gating

| Tier | What | Source | Where |
|------|------|--------|-------|
| 0 SFW | clothed, suggestive | AI (nano-banana) | public/marketing |
| 1 Sensual | boudoir, implied, lingerie | AI (Flux) | behind age gate |
| 2 Explicit | actual explicit | **real verified members / licensed only — never AI** | deep gated |

NSFW primitives (built, ready for Tier-2): `src/lib/nsfw.ts`, `src/lib/hooks/use-nsfw.ts`, `src/components/safety/nsfw-gate.tsx` (`<NsfwGate level="explicit">…</NsfwGate>` blur-until-reveal).

**Adult-business reality (before Tier-2 ships):** Stripe/Vercel/Supabase prohibit explicit content. Need: an **adult payment processor** (CCBill/Segpay/Verotel), **adult-friendly storage/CDN** (BunnyCDN) on a separate media domain, **2257 records**, and **real age-verification** (Yoti/Persona). Get an adult-industry lawyer. Keep Stripe for the SFW founding funnel only.

---

## 6. State of the build

**Done:** Cinematic homepage (living Veo aura video, breathing real-DOM phone mockup, authentic personas, testimonials, humanized copy) · founding pre-sale page (animated seat meter, rotating quotes, breathing CTA, Stripe + waitlist wired) · all public + authenticated pages redesigned to Velvet Aura with distinct backgrounds · Phosphor icons everywhere · image-led Desires picker · NSFW gating primitives · full SHORTAPI asset pipeline.

**Verified:** `npx tsc --noEmit` → 0 errors. All public routes 200.

**Limitations / TODO:**
- **Supabase not wired** (placeholders) → authenticated pages 307 → login. Dev preview via `PREVIEW_AUTH=1` (bypasses age-gate + auth in `middleware.ts` + the `(authenticated)`/`(admin)` layouts + per-page guards — search `PREVIEW_AUTH`). **Remove all `PREVIEW_AUTH` bypasses before launch.**
- **Stripe** keys are placeholders.
- **Seed demo data** so matches/events/messages look populated (next high-value task).
- Mint real **PWA icons** (`/icon-192.png` 404).
- Remaining video loops (silk/candle/intimacy) optional.

---

## 7. Useful paths

- Homepage: `src/app/page.tsx` · Hero mockup: `src/components/marketing/hero-mockup.tsx` · Aura video: `src/components/marketing/aura-video.tsx`
- Founding funnel: `src/app/(public)/founding/` · Config: `src/config/founding.ts`
- Auth app shell: `src/app/(authenticated)/authenticated-shell.tsx` · Nav: `src/components/layout/{sidebar,header,mobile-nav}.tsx` · `src/config/navigation.ts`
- Desires: `src/config/interests.ts` + `src/config/desire-moods.ts` + `src/components/onboarding/interest-selector.tsx`
- Generated assets: `public/generated/` · Manifest: `public/generated/manifest.json`
