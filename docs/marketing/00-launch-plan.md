# Paixão — 2-Week Launch Plan
**Campaign period:** Day 1–14  
**Objective:** Prove demand. Convert cold strangers into paying founding members.  
**Funnel:** Cold traffic → Homepage → Age-gate → `/founding` → Waitlist OR Founding checkout

---

## Funnel Architecture

```
Cold Traffic
  ↓
Homepage (brand introduction, "Welcome to the Passion Den")
  ↓
Age Gate (consent + DOB confirmation)
  ↓
/founding page
  ├── FREE: Email waitlist (low friction, high volume)
  └── PAID: Founding membership (one-time, tiered)
        Tier 1:  #1–100   → CA$39
        Tier 2: #101–200  → CA$139
        Tier 3: #201–300  → CA$499
        Then: closed
```

---

## Funnel Math & Targets

### Baseline assumptions (conservative)
| Metric | Target | Notes |
|--------|--------|-------|
| Landing → Age-gate pass | 70% | Most people who click an ad are curious; gate should feel smooth |
| Age-gate → `/founding` view | 90% | One-click confirm, minimal friction |
| `/founding` view → Waitlist signup | 25% | Email capture; free, low friction |
| `/founding` view → Founding checkout | 3–5% | Paying, cold traffic, premium price |
| Waitlist → Founding conversion (email nurture) | 10–15% | Over 5-email sequence, 14-day window |

### Revenue model for 14 days
If you drive **2,000 unique landing page visitors**:
- ~1,260 pass age gate (~63% blended)
- ~315 join waitlist (25% of 1,260)
- ~38–63 buy direct from landing page (3–5% of 1,260)
- ~32–47 convert from waitlist nurture (10–15% of 315)
- **Total founding members: ~70–110 people**

At blended CA$39 (Tier 1 fills first):
- First 100 @ CA$39 = CA$3,900
- Overflow @ CA$139 = additional upside

---

## GO / NO-GO Success Metrics

### Green Light (proceed to full build + funding)
- **50+ paying founding members in 14 days**
- Landing → waitlist conversion ≥ 15%
- Waitlist → founder conversion ≥ 8% (from email nurture)
- Zero critical trust/safety complaints
- At least 1 organic social share or press mention

### Yellow (demand exists, refine before scaling)
- 20–49 paying founders
- Waitlist conversion 8–14%
- Cost per founder < CA$80

### Red Light (pivot signal)
- < 20 paying founders after full 14-day effort
- Cost per founder > CA$200
- High age-gate abandonment (> 50%) — signal: wrong traffic or confusing UX
- High checkout abandonment (> 95%) — signal: price too high or trust gap

---

## Budget Allocation (Suggested CA$500–1,000 test budget)

| Channel | Daily Spend | 14-Day Total | Expected Clicks |
|---------|------------|--------------|-----------------|
| Meta (IG Stories + Reels) | CA$20–35 | CA$280–490 | 400–700 |
| Reddit (r/Alberta, adult subs) | CA$10 | CA$140 | 200–400 |
| X/Twitter promoted posts | CA$5–10 | CA$70–140 | 150–300 |
| Organic / creator (cost = time) | — | — | 200–500 |
| **Total** | **CA$35–55/day** | **CA$490–770** | **950–1,900** |

---

## Day-by-Day Plan

### Phase 1: Setup & Seeding (Days 1–3)
**Day 1 — Infrastructure**
- [ ] Confirm Stripe + Supabase are live; run test checkout end-to-end
- [ ] Set up UTM parameters for every channel (source/medium/campaign/content)
- [ ] Connect Google Analytics 4 (or Plausible) — funnel events: `age_gate_pass`, `waitlist_signup`, `founding_checkout_start`, `founding_checkout_complete`
- [ ] Create Meta Business Manager ad account + upload first 3 creatives
- [ ] Create Reddit ad account; create X/Twitter ads account
- [ ] Set up daily tracking spreadsheet (template below)

**Day 2 — Warm launch: organic only**
- [ ] Post Day 1 X/Twitter thread (brand story + founding concept)
- [ ] Post on 2 relevant subreddits (r/Alberta + 1 lifestyle sub) — follow self-promo rules
- [ ] DM 5 potential creator partners (see `04-creator-outreach.md`)
- [ ] Share with personal network / founding team for first 3–5 organic signups
- [ ] Monitor funnel events; fix any broken flows

**Day 3 — Paid launch: Meta campaigns go live**
- [ ] Launch Meta campaign with 2 ad sets (IG Reels + IG Stories), 3 creatives each
- [ ] Budget: CA$25/day to start
- [ ] Target: Alberta adults 25–45, interest in luxury lifestyle, nightlife, exclusive clubs
- [ ] Monitor CTR, CPC, and age-gate pass rate within first 6 hours
- [ ] First waitlist email send: Welcome email (Email #1 from sequence)

---

### Phase 2: Optimization (Days 4–7)
**Day 4**
- [ ] Review Day 3 Meta data: kill ads with CTR < 0.5%, boost winners
- [ ] Post 2 X/Twitter posts (use organic set from `02-organic-adult-friendly.md`)
- [ ] Reply to any comments/DMs with warmth and brand voice

**Day 5**
- [ ] Launch Reddit ads (r/Alberta audience + run-of-network adult subreddits if budget permits)
- [ ] Send Email #2 (vision/story) to waitlist
- [ ] A/B test: try one new Meta headline variant

**Day 6**
- [ ] Review full-funnel data: where is the biggest drop-off?
- [ ] If age-gate abandonment > 50%: simplify gate UX
- [ ] If checkout abandonment > 90%: add a trust signal (testimonial, refund policy note, founder count)
- [ ] Post FetLife intro (see `02-organic-adult-friendly.md`)
- [ ] Respond to every organic comment/share

**Day 7 — Mid-point review**
- [ ] Full GO/NO-GO check against metrics above
- [ ] Decision point: increase budget to CA$50/day if CPA < CA$80; hold or cut if > CA$150
- [ ] Send Email #3 (founding urgency + escalating price) to waitlist
- [ ] Creator check-in: follow up on any DM responses

---

### Phase 3: Push (Days 8–11)
**Day 8**
- [ ] Scale winning Meta ad sets to CA$40–50/day
- [ ] Launch TikTok ads if account is warmed (see `01-mainstream-ads-sfw.md`)
- [ ] New X/Twitter post batch (rotation)

**Day 9**
- [ ] Send Email #4 (social proof + community vision) to waitlist
- [ ] Post Reddit follow-up / AMA-style thread if community is engaging
- [ ] Reach out to 5 more creators

**Day 10**
- [ ] Mid-tier price point alert: if approaching 100 founders, add banner on `/founding` page — "Price increases at 100 members. [X] spots left at CA$39."
- [ ] Screenshot real metrics + tease on X/Twitter ("We've had [X] founding members join in [X] days — doors closing soon")

**Day 11**
- [ ] Launch retargeting campaign on Meta: people who visited `/founding` but did not convert
- [ ] Retargeting copy: urgency angle, price escalation reminder
- [ ] Creator content goes live (if any creator partnerships closed)

---

### Phase 4: Last Call (Days 12–14)
**Day 12**
- [ ] Send Email #5 (last call) to waitlist
- [ ] Increase paid spend to maximum budget
- [ ] Post "48 hours left at founding price" across X, Reddit, FetLife

**Day 13**
- [ ] Final organic push: share founding member count (social proof)
- [ ] DM anyone who opened Email #5 but didn't convert (if ESP allows behavioral segmentation)
- [ ] Live reply to any comments; create urgency authentically

**Day 14 — Campaign Close**
- [ ] Final Meta/Reddit/X spend; let campaigns run until midnight
- [ ] Send post-campaign waitlist email: "Founding doors are now closed — you're on the priority list for launch"
- [ ] Pull final numbers; fill in tracking table
- [ ] Make GO/NO-GO call
- [ ] If GO: announce publicly on social + begin Phase 2 roadmap

---

## Daily Tracking Table

Copy this table into a spreadsheet. Fill in each day.

| Day | Date | Ad Spend (CA$) | Unique Visitors | Age-Gate Passes | Waitlist Signups | Checkout Starts | Founding Members | Cumulative Founders | CPA (CA$) | Notes |
|-----|------|---------------|----------------|-----------------|-----------------|-----------------|-----------------|--------------------|-----------| ------|
| 1   |      |               |                |                 |                 |                 |                 |                    |           |       |
| 2   |      |               |                |                 |                 |                 |                 |                    |           |       |
| 3   |      |               |                |                 |                 |                 |                 |                    |           |       |
| 4   |      |               |                |                 |                 |                 |                 |                    |           |       |
| 5   |      |               |                |                 |                 |                 |                 |                    |           |       |
| 6   |      |               |                |                 |                 |                 |                 |                    |           |       |
| 7   |      |               |                |                 |                 |                 |                 |                    |           |       |
| 8   |      |               |                |                 |                 |                 |                 |                    |           |       |
| 9   |      |               |                |                 |                 |                 |                 |                    |           |       |
| 10  |      |               |                |                 |                 |                 |                 |                    |           |       |
| 11  |      |               |                |                 |                 |                 |                 |                    |           |       |
| 12  |      |               |                |                 |                 |                 |                 |                    |           |       |
| 13  |      |               |                |                 |                 |                 |                 |                    |           |       |
| 14  |      |               |                |                 |                 |                 |                 |                    |           |       |
| **TOTAL** |  |             |                |                 |                 |                 |                 |                    |           |       |

**Key ratios to compute weekly:**
- Age-gate pass rate = Age-Gate Passes / Unique Visitors
- Waitlist CVR = Waitlist Signups / Age-Gate Passes
- Founding CVR (direct) = Founding Members (direct) / Age-Gate Passes
- CPA = Total Ad Spend / Total Founding Members

---

## Contingency Notes

**If price point is too high (checkout abandonment > 92%):**
- Add a "Why CA$39?" section on the founding page explaining lifetime value
- Consider a CA$19 "early access deposit" with the balance due at launch

**If traffic volume is too low (< 500 visitors by Day 7):**
- Double down on organic: more Reddit posts, more creator DMs
- Consider running a 24-hour "flash founding" event promoted on X

**If waitlist is large but no conversions:**
- Email #3 urgency email is the lever — A/B test subject lines
- Add a personal video message from the founder on the `/founding` page (builds trust)
