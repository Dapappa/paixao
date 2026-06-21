# Paixão — Getting Started / Launch Runbook

Everything you need to take this from "pretty front-end" to "fully working app with
payments + email." Work top to bottom. Things marked **REQUIRED** are needed for the
app to function; **OPTIONAL** can wait.

> **Current state:** the entire public funnel + app UI is built, on-brand, mobile-safe,
> and pushed to `main`. The **backend is not wired yet** — Supabase, Stripe, and Resend
> are on placeholder keys. This doc gets them connected.

---

## 0. Prerequisites
- **Node 20+** (you're on v24 — fine), npm, git.
- A code editor. The app is **Next.js 16 (Turbopack) + React 19 + Tailwind v4**.
- Docker is **not** required and **not** used here. Because Docker isn't available locally,
  you must use a **cloud Supabase project** (local `supabase start` won't run).

## 1. Run it locally (just to see the UI)
```bash
npm install
cp .env.example .env.local      # then fill in values (see §3)
npm run dev                     # http://localhost:3000
```
`.env.local` already includes `PREVIEW_AUTH=1`, which lets you walk every authenticated
page **without** a real login. (Remove it before launch — see §8.)

## 2. Useful commands
| Command | What |
|---|---|
| `npm run dev` | Dev server (hot reload) |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npx tsc --noEmit` | Type-check (must be clean) |
| `npm run lint` | ESLint |

---

## 3. Credentials — the full list

Put all of these in **`.env.local`** (gitignored — never commit real secrets).
A complete template lives in **`.env.example`**.

### 🔴 REQUIRED

**Supabase** (auth + database) — create a free project at <https://supabase.com> →
Project Settings → **API**:
| Var | What |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` / public key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key — **secret, server only** |

**Stripe** (payments) — <https://dashboard.stripe.com> in **Test mode** →
Developers → API keys / Webhooks:
| Var | What |
|---|---|
| `STRIPE_SECRET_KEY` | Secret key `sk_test_…` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key `pk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret `whsec_…` (see §5) |
| `STRIPE_PRICE_DESIRE_MONTHLY` / `_YEARLY` | Subscription price IDs `price_…` |
| `STRIPE_PRICE_OBSESSION_MONTHLY` / `_YEARLY` | " |
| `STRIPE_PRICE_PATRON_MONTHLY` / `_YEARLY` | " |

> The **founding $39 checkout needs no Stripe product** — it uses inline pricing from
> `FOUNDING_PRICE_*` (already set). Just the keys above make founding work. The six
> subscription price IDs are only needed for the membership tiers.

**App**
| Var | Value |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` (dev) / `https://paixao.ca` (prod) |
| `NEXT_PUBLIC_APP_NAME` | `Paixão` |

### 🟡 EMAIL (Resend) — needed for emails to actually send
Run `npm i resend`, then from <https://resend.com>:
| Var | What |
|---|---|
| `RESEND_API_KEY` | API key `re_…` |
| `EMAIL_FROM` | e.g. `Paixão <hello@paixao.ca>` — domain must be **verified in Resend** (§6) |

### 🟢 ALREADY SET / OPTIONAL
- `SHORTAPI_KEY` — already configured (image/video generation).
- `FOUNDING_PRICE_1/2/3` + `FOUNDING_CURRENCY` — escalating founding tiers
  (CA$39 → 139 → 499), already set.
- Analytics (optional): `NEXT_PUBLIC_POSTHOG_KEY` **or** `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.
- `PREVIEW_AUTH=1` — dev-only auth bypass. **Remove before launch.**

---

## 4. Supabase — apply the database schema
The project ships full SQL migrations in **`supabase/migrations/`** (profiles, events,
matchmaking, messaging, consent/safety, admin, RLS policies, waitlist) plus
`supabase/seed.sql`. After creating the cloud project, apply them one of two ways:

**Option A — Supabase CLI (recommended):**
```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>   # ref is in the project URL
npx supabase db push                                  # applies all migrations
# optional sample data:
# psql "<your-connection-string>" -f supabase/seed.sql
```

**Option B — Dashboard:** open the project's **SQL Editor** and paste each file in
`supabase/migrations/` in filename order, then `seed.sql`.

Also enable **Email** auth provider in Supabase → Authentication → Providers, and set the
Site URL / redirect URLs to your `NEXT_PUBLIC_APP_URL` (and `/auth/callback`).

---

## 5. Stripe — products, prices, webhook
**Create the 3 subscription products** (Desire, Obsession, Patron), each with a monthly +
yearly recurring price, and copy the `price_…` IDs into the `STRIPE_PRICE_*` vars.
(Claude can script this for you — see §9.)

**Webhook:**
- **Local testing:**
  ```bash
  stripe listen --forward-to localhost:3000/api/payments/webhook
  ```
  This prints a `whsec_…` → put it in `STRIPE_WEBHOOK_SECRET`.
- **Production:** Developers → Webhooks → Add endpoint
  `https://paixao.ca/api/payments/webhook` → copy its signing secret.

Test card: `4242 4242 4242 4242`, any future date, any CVC.

---

## 6. Email — Resend + DNS (on Namecheap)
1. In Resend, **add and verify your domain**. Resend gives you DNS records.
2. In **Namecheap → Domain → Advanced DNS**, add:
   - **Sending (Resend):** the `TXT`/`CNAME` records Resend shows (SPF, DKIM, DMARC).
   - **Receiving replies (free):** set up **email forwarding** so `support@…` and
     `hello@…` land in an inbox you check. Cheapest options:
     - Cloudflare Email Routing (free; requires DNS on Cloudflare), **or**
     - Namecheap's built-in Email Forwarding, **or** ImprovMX / ForwardEmail (free tiers).
   - To **reply as** `support@…` from Gmail, add it under Gmail → "Send mail as" using
     Resend's SMTP credentials.

> You do **not** need Google Workspace. Resend sends; forwarding receives.

---

## 7. Verify it works (real browser)
A CDP screenshot/overflow helper is included for checking desktop + mobile:
```bash
node scripts/cdp-overflow-check.mjs http://localhost:3000/ 390 844   # mobile overflow check
```

---

## 8. ✅ Pre-launch checklist
- [ ] Remove `PREVIEW_AUTH=1` from env (re-enables real auth on protected routes).
- [ ] Swap Stripe **test** keys → **live** keys; recreate the webhook on the live domain.
- [ ] Set `NEXT_PUBLIC_APP_URL` to the real domain; pick the **canonical** domain
      (e.g. `paixao.ca`) and 301-redirect the others.
- [ ] Supabase: production Site URL + redirect URLs; confirm RLS policies are on.
- [ ] Resend domain verified; from-address on the verified domain.
- [ ] Age-gate + 18+ confirmation working.
- [ ] **Adult-content reality:** Stripe / Vercel / Supabase prohibit *explicit* content.
      For explicit (Tier-2) you'll need an **adult-friendly processor** (CCBill/Segpay),
      an **adult-friendly CDN** (e.g. BunnyCDN), **2257 records**, and **real
      age-verification** before going live with that tier. The current build is
      sensual-not-explicit (safe for mainstream infra).

---

## 9. What Claude can do for you when you're back
Hand over the keys (in `.env.local`, not pasted in chat) and Claude can:
- Apply the Supabase schema / fix any migration issues.
- Write & run `scripts/stripe-setup.mjs` to auto-create the 3 products + 6 prices and
  print the `STRIPE_PRICE_*` IDs.
- Finish wiring **Resend** (`npm i resend`) into the founding/waitlist/verify flows.
- Generate the exact **Namecheap DNS records** to paste.
- Generate replacement **SHORTAPI** imagery and swap out placeholders.
- Run full desktop + mobile verification via the CDP harness.

## 10. Reference
- `README.md` — project overview.
- `HANDOFF.md` — prior build handoff notes.
- `AGENTS.md` / `CLAUDE.md` — agent/codebase instructions (Next 16 specifics).
- `.env.example` — the full env template.
