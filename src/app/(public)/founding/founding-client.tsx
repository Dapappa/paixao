"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LazyMotion, domAnimation, m, AnimatePresence, useInView } from "motion/react";
import { toast } from "sonner";
import {
  Crown,
  Check,
  ArrowRight,
  CircleNotch,
  CalendarHeart,
  UsersThree,
  TrendUp,
  Lock,
  Quotes,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  foundingConfig,
  formatFoundingPrice,
  type FoundingPricing,
} from "@/config/founding";
import { initAnalytics, track } from "@/lib/analytics";
import { riseIn, riseInSoft, stagger, ease, inView } from "@/lib/motion";

type Interest = "events" | "matchmaking";

/* Real member voices — rotate through them like overheard whispers. */
const MEMBER_QUOTES = [
  {
    quote: "The events undid me. Candlelight, real people, no phones out.",
    who: "Member, Edmonton",
  },
  {
    quote:
      "I locked my seat the first night. Nothing here has ever asked me to be smaller.",
    who: "Founding member, Calgary",
  },
  {
    quote: "It moves at my pace. Every yes was mine to give — that's rare.",
    who: "Member, anonymous by choice",
  },
] as const;

/* Anonymous founding voices for the proof grid (faces turned / half-lit). */
const FOUNDING_VOICES = [
  {
    quote:
      "I joined for the events and stayed for the quiet. Nobody performs here. You just arrive.",
    who: "Founding member, Calgary",
    img: "/generated/real-persona-w.webp",
  },
  {
    quote:
      "Paying upfront felt like a statement — I'm done waiting for permission to want what I want.",
    who: "Founding member, Edmonton",
    img: "/generated/real-persona-3.webp",
  },
  {
    quote:
      "It's the first room where being anonymous made me feel more myself, not less.",
    who: "Founding member, anonymous by choice",
    img: "/generated/real-persona-5.webp",
  },
] as const;

/* The friction questions a founding buyer actually asks before paying. */
const FOUNDING_FAQ = [
  {
    q: "When does Paixão actually open?",
    a: "We open the first city in stages over the coming months. Founding members get in first, help shape the rooms, and are told before anyone else.",
  },
  {
    q: "How anonymous am I, really?",
    a: "Completely, until you decide otherwise. Your name, your face, your wants — each one is yours to reveal on your timing, to whom you choose, or never at all.",
  },
  {
    q: "What am I paying for right now?",
    a: "A lifetime founding seat: the lowest price we will ever offer, locked for good, plus a real say in who we become. One quiet charge, fully refundable until we open.",
  },
] as const;

export function FoundingClient({
  claimed,
  cap,
  pricing,
}: {
  claimed: number;
  cap: number;
  pricing: FoundingPricing;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState<null | "waitlist" | "founding">(null);

  const soldOut = pricing.soldOut;
  const price = pricing.amountCents !== null ? formatFoundingPrice(pricing.amountCents) : null;
  const nextPrice =
    pricing.nextAmountCents !== null ? formatFoundingPrice(pricing.nextAmountCents) : null;

  /* Scarcity is framed against the FIRST band (the 100 founding seats). */
  const firstBandCap = foundingConfig.tiers[0].upTo;
  const seatsClaimed = Math.min(claimed, firstBandCap);
  const fillPct = Math.min(100, Math.round((seatsClaimed / firstBandCap) * 100));

  const source =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("utm_source") ?? undefined
      : undefined;

  // Initialise the configured analytics vendor and record the funnel pageview.
  useEffect(() => {
    initAnalytics();
    track("pageview", {
      path: "/founding",
      claimed,
      sold_out: soldOut,
      source: source ?? null,
    });
  }, [claimed, soldOut, source]);

  function toggleInterest(value: Interest) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value],
    );
  }

  function validEmail(): boolean {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("That email didn't look right. Try again.");
      return false;
    }
    return true;
  }

  async function joinWaitlist() {
    if (!validEmail()) return;
    setLoading("waitlist");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, city, interestedIn: interests, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      track("waitlist_signup", {
        city: city || null,
        interests: interests.join(",") || null,
        source: source ?? null,
      });
      router.push("/founding/thank-you?type=waitlist");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  async function becomeFounding() {
    if (!validEmail()) return;
    setLoading("founding");
    track("founding_checkout_start", {
      city: city || null,
      amount_cents: pricing.amountCents,
      source: source ?? null,
    });
    try {
      const res = await fetch("/api/founding/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, city, source }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout unavailable");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout unavailable");
      setLoading(null);
    }
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative min-h-dvh overflow-hidden bg-background">
        {/* ── Ambient aura backdrop (Velvet Aura) ── */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="aura-field absolute inset-0 animate-aura-drift opacity-70" />
          <div className="absolute left-1/2 top-[-12%] h-[620px] w-[820px] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-5%] h-[440px] w-[600px] rounded-full bg-gold/[0.05] blur-[120px]" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-screen blur-[2px]"
            style={{ backgroundImage: "url(/generated/hero-aura.webp)" }}
          />
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
          {/* ── Left: the invitation ── */}
          <m.div initial="hidden" animate="visible" variants={stagger}>
            <m.div variants={riseIn} custom={0}>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.06] px-4 py-1.5 text-xs font-medium text-gold backdrop-blur-sm">
                <Crown className="h-3.5 w-3.5" weight="fill" />
                {soldOut
                  ? "Every founding seat is taken"
                  : `${pricing.remainingInBand} seats left at ${price}`}
              </span>
            </m.div>

            <m.p
              variants={riseIn}
              custom={1}
              className="mt-6 text-xs font-medium uppercase tracking-[0.34em] text-text-secondary"
            >
              <span className="animate-breath font-serif text-sm font-bold tracking-wider text-foreground">
                PAIX<span className="text-accent">Ã</span>O
              </span>{" "}
              Founding seats
            </m.p>

            <m.h1
              variants={riseIn}
              custom={2}
              className="mt-4 font-serif text-4xl font-bold leading-[1.06] tracking-tight sm:text-5xl"
            >
              <span className="text-foreground">Hold one of the</span>
              <br />
              <span className="text-gradient-brand">first hundred seats.</span>
            </m.h1>

            <m.p
              variants={riseIn}
              custom={3}
              className="mt-6 max-w-md text-base leading-relaxed text-text-secondary"
            >
              The first hundred set the tone for everyone after them. Only {cap}
              {" "}seats open before the doors close. Found this room with us: a
              lifetime seat at{" "}
              <span className="text-foreground">{price ?? "CA$39"}</span>, a price
              that never moves, and a real say in who we become.
            </m.p>

            {/* ── Scarcity meter — counts up + fills on view ── */}
            {!soldOut && (
              <m.div variants={riseIn} custom={4} className="mt-8 max-w-md">
                <SeatMeter
                  claimed={seatsClaimed}
                  cap={firstBandCap}
                  fillPct={fillPct}
                />
              </m.div>
            )}

            <m.ul variants={stagger} className="mt-8 space-y-3">
              {foundingConfig.perks.map((perk, i) => (
                <m.li
                  key={perk}
                  variants={riseInSoft}
                  custom={i}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent-muted">
                    <Check className="h-3 w-3 text-accent" weight="bold" />
                  </span>
                  <span className="text-sm text-foreground/90">{perk}</span>
                </m.li>
              ))}
            </m.ul>

            {!soldOut && (
              <m.div variants={riseIn} custom={5} className="mt-8 flex items-baseline gap-2">
                <span className="animate-breath font-serif text-4xl font-bold text-foreground">
                  {price}
                </span>
                <span className="text-sm text-text-secondary">once, yours for good</span>
              </m.div>
            )}

            {!soldOut && nextPrice && (
              <m.p
                variants={riseIn}
                custom={6}
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-gold"
              >
                <TrendUp className="h-3.5 w-3.5" weight="light" />
                The price only rises — {price} now, {nextPrice} once {pricing.nextThresholdAt} are
                gone, never reopens.
              </m.p>
            )}

            {/* ── Rotating real member voices ── */}
            <m.div variants={riseIn} custom={7} className="mt-8 max-w-md">
              <RotatingQuote />
            </m.div>

            {/* ── Authentic atmosphere band — a real couple, not a studio ── */}
            <m.div
              variants={riseIn}
              custom={8}
              className="relative mt-10 aspect-[16/11] w-full overflow-hidden rounded-2xl border border-border/40 sm:aspect-[16/10]"
            >
              <Image
                src="/generated/real-couple.webp"
                alt="A real couple laughing together by fairy light"
                fill
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-serif text-lg italic leading-snug text-foreground">
                  This is what the first hundred are building. Pull up a seat.
                </p>
              </div>
            </m.div>
          </m.div>

          {/* ── Right: the velvet rope ── */}
          <m.div
            initial={{ opacity: 0, y: 36, scale: 0.97 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { delay: 0.35, duration: 0.8, ease: ease.enter },
            }}
            className="relative h-fit overflow-hidden rounded-2xl border border-border/60 bg-surface/60 p-6 backdrop-blur-sm shadow-glow-accent sm:p-8 lg:sticky lg:top-24"
          >
            {/* warm, authentic backdrop — real cozy room, heavily graded for legibility */}
            <Image
              src="/generated/real-ambiance.webp"
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 1024px) 100vw, 520px"
              className="pointer-events-none object-cover object-center opacity-20"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-surface/70 via-surface/85 to-surface/95" />
            <div className="aura-field pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative">
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                Claim your seat
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {soldOut
                  ? "The founding seats are gone — leave your email and we'll hold the door for launch."
                  : "Take a founding seat now, or leave your email and we'll call you in."}
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-foreground">
                    City <span className="text-text-secondary">(optional)</span>
                  </label>
                  <Input
                    id="city"
                    placeholder="Calgary, Edmonton…"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div>
                  <span className="mb-2 block text-sm font-medium text-foreground">
                    What pulls you in
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <InterestPill
                      active={interests.includes("events")}
                      onClick={() => toggleInterest("events")}
                      icon={<CalendarHeart className="h-4 w-4" weight="light" />}
                      label="Events"
                    />
                    <InterestPill
                      active={interests.includes("matchmaking")}
                      onClick={() => toggleInterest("matchmaking")}
                      icon={<UsersThree className="h-4 w-4" weight="light" />}
                      label="Matchmaking"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {/* ── Magnetic primary CTA — breathes until you take it ── */}
                <m.div
                  animate={
                    loading !== null || soldOut
                      ? { scale: 1 }
                      : { scale: [1, 1.018, 1] }
                  }
                  transition={{
                    duration: 3.4,
                    repeat: Infinity,
                    ease: ease.elegant,
                  }}
                >
                  <Button
                    size="lg"
                    className="group w-full shadow-glow-accent"
                    onClick={becomeFounding}
                    disabled={loading !== null || soldOut}
                  >
                    {loading === "founding" ? (
                      <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
                    ) : (
                      <>
                        {soldOut ? "The seats are full" : `Claim your seat · ${price}`}
                        {!soldOut && (
                          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" weight="bold" />
                        )}
                      </>
                    )}
                  </Button>
                </m.div>

                {!soldOut && (
                  <button
                    type="button"
                    onClick={joinWaitlist}
                    disabled={loading !== null}
                    className="mx-auto block text-center text-sm text-text-secondary underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:opacity-50"
                  >
                    {loading === "waitlist"
                      ? "Saving…"
                      : "Not ready to commit? Leave your email instead"}
                  </button>
                )}
                {soldOut && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={joinWaitlist}
                    disabled={loading !== null}
                  >
                    {loading === "waitlist" ? (
                      <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
                    ) : (
                      "Hold the door for me at launch"
                    )}
                  </Button>
                )}
              </div>

              {!soldOut && nextPrice && (
                <p className="mt-4 inline-flex items-center gap-1.5 text-center text-xs text-gold/90">
                  <Lock className="h-3 w-3" weight="fill" />
                  Lock {price} for life — it climbs to {nextPrice} the moment the
                  hundredth seat goes.
                </p>
              )}

              <p className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-center text-xs text-text-secondary">
                <span>18+ only</span>
                <span>Discreet, secure checkout by Stripe</span>
                <span>Fully refundable until we open</span>
              </p>
            </div>
          </m.div>
        </div>

        {/* ════════════════ SECOND ACT — what you're joining ════════════════ */}

        {/* ── "What a night looks like" cinematic band ── */}
        <Reveal className="relative z-10 mx-auto mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-border/40 sm:aspect-[21/9]">
            <Image
              src="/generated/lounge-couple.webp"
              alt="Two people close together in a candlelit lounge"
              fill
              sizes="(max-width: 1152px) 100vw, 1100px"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-end p-6 sm:p-12">
              <div className="max-w-md">
                <p className="text-xs font-medium uppercase tracking-[0.34em] text-gold/80">
                  What a night looks like
                </p>
                <p className="mt-3 font-serif text-2xl italic leading-snug text-foreground sm:text-3xl">
                  Candlelight. Real people. No phones out. The night finds its own shape.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Proof: three founding voices ── */}
        <section className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
          <Reveal className="mx-auto max-w-xl text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.34em] text-gold/80">
              In their words
            </p>
            <h2 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Why they took a <span className="text-gradient-brand">seat</span>
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {FOUNDING_VOICES.map((v, i) => (
              <Reveal key={v.who} delay={i * 0.08}>
                <figure className="flex h-full flex-col rounded-2xl border border-border/50 bg-surface/40 p-6 backdrop-blur-sm">
                  <Quotes className="h-6 w-6 text-gold/50" weight="fill" />
                  <blockquote className="mt-4 flex-1 font-serif text-lg italic leading-relaxed text-foreground/90">
                    {v.quote}
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span className="relative h-10 w-10 overflow-hidden rounded-full border border-gold/20">
                      <Image src={v.img} alt="" fill sizes="40px" className="object-cover object-center" />
                    </span>
                    <span className="text-xs uppercase tracking-[0.18em] text-gold/80">{v.who}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── FAQ — the friction questions, answered ── */}
        <section className="relative z-10 mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Before you decide
            </h2>
          </Reveal>
          <dl className="mt-12 divide-y divide-border/50">
            {FOUNDING_FAQ.map((item, i) => (
              <Reveal key={item.q} delay={i * 0.06}>
                <div className="py-7">
                  <dt className="font-serif text-xl text-foreground">{item.q}</dt>
                  <dd className="mt-3 leading-relaxed text-text-secondary">{item.a}</dd>
                </div>
              </Reveal>
            ))}
          </dl>

          {/* Founder note + final CTA */}
          <Reveal className="mt-10 border-t border-border/50 pt-10 text-center">
            <p className="mx-auto max-w-xl font-serif text-lg italic leading-relaxed text-foreground/90">
              We are building the room we always wished existed — kinder, safer, more beautiful than
              anyone bothered to make before. The first hundred build it with us.
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.25em] text-gold/80">
              — the people behind Paixão
            </p>
            <div className="mt-8 flex justify-center">
              <Button size="lg" asChild className="group min-w-[210px] animate-pulse-glow">
                <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                  Claim your founding seat
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" weight="bold" />
                </a>
              </Button>
            </div>
          </Reveal>
        </section>

        {/* ── Atmosphere overlays (fixed, non-interactive) ── */}
        <div className="vignette" aria-hidden />
        <div className="film-grain" aria-hidden />
      </div>
    </LazyMotion>
  );
}

/* ------------------------------------------------------------------ */
/* Reveal — a single scroll-into-view rise. The second act lives below */
/* the fold, so it animates on view rather than on page-load stagger.  */
/* ------------------------------------------------------------------ */
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: ease.enter, delay }}
      className={className}
    >
      {children}
    </m.div>
  );
}

/* ------------------------------------------------------------------ */
/* Scarcity meter — number counts up + the bar fills, both on view.    */
/* ------------------------------------------------------------------ */
function SeatMeter({
  claimed,
  cap,
  fillPct,
}: {
  claimed: number;
  cap: number;
  fillPct: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, inView);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!visible) return;
    if (claimed <= 0) {
      setDisplay(0);
      return;
    }
    const duration = 1100;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out for a refined settle
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * claimed));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, claimed]);

  return (
    <div ref={ref}>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-text-secondary">
          {claimed <= 0 ? (
            <span className="font-serif text-base italic text-foreground">
              The founding doors just opened
            </span>
          ) : (
            <>
              <span className="font-serif text-xl font-bold text-foreground">
                {display}
              </span>{" "}
              of {cap} seats claimed
            </>
          )}
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold/90">
          {claimed <= 0 ? "Be the first" : `${cap - claimed} left`}
        </span>
      </div>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-border/60">
        <m.div
          initial={{ width: 0 }}
          animate={visible ? { width: `${fillPct}%` } : { width: 0 }}
          transition={{ duration: 1.2, ease: ease.enter, delay: 0.1 }}
          className="h-full rounded-full bg-gradient-to-r from-accent to-gold shadow-glow-accent"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Rotating member voices — overheard, one at a time.                  */
/* ------------------------------------------------------------------ */
function RotatingQuote() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setI((prev) => (prev + 1) % MEMBER_QUOTES.length);
    }, 5200);
    return () => clearInterval(id);
  }, []);

  const current = MEMBER_QUOTES[i];

  return (
    <div className="border-l-2 border-gold/40 pl-4">
      <AnimatePresence mode="wait">
        <m.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.6, ease: ease.enter }}
        >
          <p className="font-serif text-base italic leading-relaxed text-foreground/85">
            &ldquo;{current.quote}&rdquo;
          </p>
          <span className="mt-2 block text-xs uppercase tracking-[0.25em] text-gold/90">
            {current.who}
          </span>
        </m.div>
      </AnimatePresence>
    </div>
  );
}

function InterestPill({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "border-accent/60 bg-accent-muted text-accent"
          : "border-border bg-surface/50 text-text-secondary hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
