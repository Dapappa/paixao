"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  useInView,
} from "motion/react";
import {
  ArrowRight,
  Sparkle,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { HeroMockup } from "@/components/marketing/hero-mockup";
import { AuraVideo } from "@/components/marketing/aura-video";
import { WhyPaixao } from "@/components/marketing/why-paixao";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { RevealText, ParallaxLayer, VelvetCursor } from "@/components/marketing/motion-primitives";
import { riseIn, riseInSoft, stagger, inView } from "@/lib/motion";

/* ------------------------------------------------------------------ */
/* Section reveal helper                                               */
/* ------------------------------------------------------------------ */

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, inView);
  return (
    <m.section ref={ref} initial="hidden" animate={visible ? "visible" : "hidden"} variants={stagger} className={className}>
      {children}
    </m.section>
  );
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const testimonials = [
  { quote: "I spent years editing myself on every other app. Three weeks in here and I'd already said the things I never say out loud — to someone who only leaned closer.", who: "Member, Calgary" },
  { quote: "The events undid me, honestly. Candlelight, real people, no phones out, no performance. I left feeling like I'd been somewhere — not just scrolled through someone.", who: "Member, Edmonton" },
  { quote: "What sold me was how slow it let me go. Nobody pushed. Every yes was mine to give, and that's the most wanted I've felt in a long time.", who: "Member, anonymous by choice" },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="relative min-h-dvh overflow-x-clip bg-background">
        <VelvetCursor />
        {/* ── Ambient aura backdrop (Velvet Aura) ── */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="aura-field absolute inset-0 animate-aura-drift opacity-70" />
          <div className="absolute left-1/2 top-[-10%] h-[640px] w-[820px] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-5%] h-[460px] w-[620px] rounded-full bg-gold/[0.05] blur-[120px]" />
          {/* living aura — Veo 3.1 loop, screened over the gradients */}
          <AuraVideo className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-screen" />
        </div>

        {/* ── Navigation ── */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-xl">
          <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="animate-breath font-serif text-2xl font-bold tracking-[0.18em] text-foreground sm:text-3xl">
                PAIX<span className="text-accent">Ã</span>O
              </span>
            </Link>
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/about" className="rounded-md px-4 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:text-foreground">About</Link>
              <Link href="/guidelines" className="rounded-md px-4 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:text-foreground">Guidelines</Link>
              <div className="ml-4 h-6 w-px bg-border" />
              <div className="ml-3 flex items-center gap-2.5">
                <Button variant="ghost" asChild><Link href="/auth/login">Log In</Link></Button>
                <Button asChild><Link href="/auth/signup">Step inside</Link></Button>
              </div>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <Button variant="ghost" size="sm" asChild><Link href="/auth/login">Log In</Link></Button>
              <Button size="sm" asChild><Link href="/auth/signup">Step inside</Link></Button>
            </div>
          </nav>
        </header>

        {/* ── Hero: headline + living product ── */}
        <section className="relative z-10 mx-auto grid min-h-dvh max-w-7xl grid-cols-1 items-center gap-12 px-4 pt-28 pb-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8">
          {/* Left: copy */}
          <m.div initial="hidden" animate="visible" variants={stagger} className="text-center lg:text-left">
            <m.p variants={riseIn} custom={1} className="mb-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-medium uppercase tracking-[0.28em] text-text-secondary sm:text-[13px] sm:tracking-[0.34em] lg:justify-start">
              <Sparkle className="h-4 w-4 shrink-0 text-gold" weight="fill" />
              Welcome to the Passion Den
            </m.p>

            <RevealText
              className="block font-serif text-[clamp(2.1rem,7.5vw,4.75rem)] font-medium leading-[1.02] tracking-[-0.02em]"
              delay={0.15}
              lines={[
                { text: "Come as you want.", className: "text-foreground" },
                { text: "Leave nothing behind.", className: "text-gradient-brand" },
              ]}
            />

            <m.p variants={riseIn} custom={3} className="mt-6 font-serif text-3xl italic text-gold sm:text-4xl">
              Desire, kept in confidence.
            </m.p>

            <m.p variants={riseIn} custom={4} className="mx-auto mt-7 max-w-xl text-xl leading-relaxed text-text-secondary sm:text-2xl lg:mx-0">
              A members-only room for grown adults who know exactly what they&rsquo;re after. Meet on your
              terms, show only what you choose, and let the night find its own shape — no pressure, no
              traces, no apologies. Whatever you&rsquo;ve been quiet about, you can finally say it here.
            </m.p>

            <m.p variants={riseIn} custom={5} className="mt-8 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 lg:justify-start">
              <span className="font-serif text-xl text-gold sm:text-2xl">A lifetime founding seat for CA$39.</span>
              <span className="text-base text-text-secondary">Only the first 100.</span>
            </m.p>

            <m.div variants={riseIn} custom={6} className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button size="lg" asChild className="group min-w-[190px] animate-pulse-glow">
                <Link href="/founding">
                  Claim your seat
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" weight="bold" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="min-w-[160px]"><a href="#features">See the room</a></Button>
            </m.div>

            <m.div variants={riseIn} custom={7} className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-[15px] text-text-secondary lg:justify-start">
              <span>18+ only</span>
              <span>Your identity remains anonymous</span>
              <span>Cancel anytime</span>
            </m.div>
          </m.div>

          {/* Right: the breathing app mockup */}
          <m.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.5, duration: 0.9, ease: [0.05, 0.7, 0.1, 1] } }}
            className="relative flex justify-center lg:justify-end"
          >
            <HeroMockup />
          </m.div>
        </section>

        {/* ── Atmosphere band — the room ── */}
        <AnimatedSection className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <m.div
            variants={riseIn}
            custom={0}
            className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-border/40 sm:aspect-[21/9]"
          >
            <ParallaxLayer
              src="/generated/real-couple.webp"
              alt="A couple laughing together on their bed under warm fairy lights"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
              kenBurns
            />
            {/* legibility + mood grade */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-end p-6 sm:p-12">
              <div className="max-w-md">
                <p className="font-serif text-2xl italic leading-snug text-foreground sm:text-3xl">
                  &ldquo;The best conversations begin after midnight.&rdquo;
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.25em] text-gold/90">
                  A founding member, Calgary
                </p>
              </div>
            </div>
          </m.div>
        </AnimatedSection>

        {/* ── Why Paixão — cinematic scroll-driven feature panels ── */}
        <WhyPaixao />

        {/* ── How It Works — self-drawing scroll timeline ── */}
        <HowItWorks />

        {/* ── Testimonials ── */}
        <AnimatedSection className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <m.div variants={riseIn} custom={0} className="text-center">
            <h2 className="font-serif text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Said quietly, <span className="text-gradient-gold">after</span>.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
              What members tell us once the room has done its work.
            </p>
          </m.div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <m.figure
                key={t.who}
                variants={riseInSoft}
                custom={i}
                className="relative flex flex-col justify-between rounded-2xl border border-border/50 bg-surface/50 p-7 backdrop-blur-sm"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}
              >
                <blockquote className="font-serif text-lg italic leading-relaxed text-foreground/90">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 text-xs uppercase tracking-[0.2em] text-gold/80">
                  {t.who}
                </figcaption>
              </m.figure>
            ))}
          </div>
        </AnimatedSection>

        {/* ── CTA ── */}
        <AnimatedSection className="relative z-10 px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <m.div variants={riseIn} custom={0} className="relative overflow-hidden rounded-2xl border border-border/50 bg-surface/60 p-12 backdrop-blur-sm sm:p-16">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: "url(/generated/velvet-texture.webp)" }}
              />
              <div className="aura-field absolute inset-0 opacity-50" />
              <div className="relative">
                <h2 className="font-serif text-4xl font-bold leading-[1.06] tracking-tight sm:text-5xl">Hold one of the first hundred seats.</h2>
                <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-text-secondary">
                  The first hundred set the tone for everyone after them. Found this room with us: a lifetime
                  seat at CA$39, a price that never moves, and a real say in who we become and which city opens
                  next. The seat costs more once a hundred are taken — and it never reopens at this price.
                </p>
                <div className="mt-8 flex justify-center">
                  <Button size="lg" asChild className="group min-w-[200px]">
                    <Link href="/founding">
                      Claim your seat
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" weight="bold" />
                    </Link>
                  </Button>
                </div>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-[13px] text-text-secondary">
                  <span>18+ only</span>
                  <span>Your identity stays anonymous</span>
                  <span>A price that never moves</span>
                </div>
              </div>
            </m.div>
          </div>
        </AnimatedSection>

        {/* ── Footer ── */}
        <footer className="relative z-10 border-t border-border/50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
              <div>
                <span className="font-serif text-lg font-bold tracking-wider text-foreground">PAIX<span className="text-accent">Ã</span>O</span>
                <p className="mt-1 text-xs text-text-secondary">Welcome to the Passion Den. Where desire meets discretion.</p>
              </div>
              <div className="flex items-center gap-6 text-sm text-text-secondary">
                <Link href="/about" className="transition-colors hover:text-foreground">About</Link>
                <Link href="/guidelines" className="transition-colors hover:text-foreground">Guidelines</Link>
                <Link href="/terms" className="transition-colors hover:text-foreground">Terms</Link>
              </div>
            </div>
            <div className="mt-8 border-t border-border/30 pt-6 text-center text-xs text-text-secondary">
              &copy; {new Date().getFullYear()} Paixão. All rights reserved. This platform is intended for adults 18 years of age and older.
            </div>
          </div>
        </footer>

        {/* ── Atmosphere overlays (fixed, non-interactive) ── */}
        <div className="vignette" aria-hidden />
        <div className="film-grain" aria-hidden />
      </div>
    </LazyMotion>
  );
}
