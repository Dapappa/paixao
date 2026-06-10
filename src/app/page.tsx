"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  useInView,
} from "motion/react";
import {
  Shield,
  CalendarDots,
  Heart,
  HandHeart,
  UserPlus,
  MagnifyingGlass,
  ChatCircle,
  ArrowRight,
  Sparkle,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { HeroMockup } from "@/components/marketing/hero-mockup";
import { AuraVideo } from "@/components/marketing/aura-video";
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

const features = [
  { icon: Shield, title: "Anonymous until you decide", description: "You stay a stranger as long as you like. A name, a face, a want — each one is yours to offer, never taken. Reveal it on your timing, or never at all." },
  { icon: CalendarDots, title: "Rooms worth dressing for", description: "Hand-picked gatherings for verified members — a candlelit dozen or a full velvet floor. You'll know the guest list is real before you ever walk in." },
  { icon: Heart, title: "Wanted for who you are", description: "No swiping into a blur of strangers. We pair you on the things you'd never put on a first date — the real appetites — so the people who find you actually mean it." },
  { icon: HandHeart, title: "Yes means everything here", description: "Every touch, every step, every door — opened only by mutual yes. Boundaries set the tempo, and they're honored without a second thought." },
];

const steps = [
  { icon: UserPlus, step: "01", title: "Slip in unseen", description: "Sign up anonymous. Build the version of you that you actually want met — keep the rest under wraps until you say otherwise." },
  { icon: MagnifyingGlass, step: "02", title: "Read the room", description: "Wander the events, the profiles, the quiet corners. See who lingers on you, and notice who you can't stop coming back to." },
  { icon: ChatCircle, step: "03", title: "Lean in", description: "A first message, a held glance, an invitation across the floor. Move at your own pace — every step waits for your yes." },
];

const testimonials = [
  { quote: "I spent years editing myself on every other app. Three weeks in here and I'd already said the things I never say out loud — to someone who only leaned closer.", who: "Member · Calgary" },
  { quote: "The events undid me, honestly. Candlelight, real people, no phones out, no performance. I left feeling like I'd been somewhere — not just scrolled through someone.", who: "Member · Edmonton" },
  { quote: "What sold me was how slow it let me go. Nobody pushed. Every yes was mine to give, and that's the most wanted I've felt in a long time.", who: "Member · anonymous by choice" },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="relative min-h-dvh overflow-hidden bg-background">
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
            <m.div variants={riseIn} custom={0} className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-4 py-1.5 text-xs font-medium text-text-secondary backdrop-blur-sm">
                <Sparkle className="h-3.5 w-3.5 text-gold" weight="fill" />
                By invitation · After dark · First 100 seats
              </span>
            </m.div>

            <m.p variants={riseIn} custom={1} className="mb-4 text-xs font-medium uppercase tracking-[0.34em] text-text-secondary">
              Welcome to the Passion Den
            </m.p>

            <m.h1 variants={riseIn} custom={2} className="font-serif text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              <span className="text-foreground">Come as you want.</span>
              <br />
              <span className="text-gradient-brand">Leave nothing behind.</span>
            </m.h1>

            <m.p variants={riseIn} custom={3} className="mt-5 font-serif text-xl italic text-gold">
              Desire, kept in confidence.
            </m.p>

            <m.p variants={riseIn} custom={4} className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg lg:mx-0">
              A members-only room for grown adults who know exactly what they&rsquo;re after. Meet on your
              terms, show only what you choose, and let the night find its own shape — no pressure, no
              traces, no apologies. Whatever you&rsquo;ve been quiet about, you can finally say it here.
            </m.p>

            <m.div variants={riseIn} custom={5} className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button size="lg" asChild className="group min-w-[190px]">
                <Link href="/founding">
                  Claim your seat
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" weight="bold" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="min-w-[160px]"><a href="#features">See the room</a></Button>
            </m.div>

            <m.p variants={riseIn} custom={6} className="mt-6 text-xs text-text-secondary">
              18+ only · Your identity remains anonymous · Cancel anytime
            </m.p>
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
            <Image
              src="/generated/real-couple.webp"
              alt="A couple laughing together on their bed under warm fairy lights"
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center"
              priority
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
                  A founding member · Calgary
                </p>
              </div>
            </div>
          </m.div>
        </AnimatedSection>

        {/* ── Features ── */}
        <AnimatedSection className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div id="features" className="scroll-mt-24">
            <m.div variants={riseIn} custom={0} className="text-center">
              <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                Why <span className="text-gradient-brand">Paixão</span>?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
                Built from the ground up with safety, privacy, and pleasure in mind.
                Every feature exists to protect and empower you.
              </p>
            </m.div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <m.div
                  key={feature.title}
                  variants={riseInSoft}
                  custom={i}
                  className="group relative rounded-xl border border-border/50 bg-surface/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:bg-surface/80 hover:shadow-glow-accent"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-accent-muted p-3">
                    <feature.icon className="h-5 w-5 text-accent" weight="duotone" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-text-secondary">{feature.description}</p>
                </m.div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* ── How It Works ── */}
        <AnimatedSection className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <m.div variants={riseIn} custom={0} className="text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              How It <span className="text-gradient-gold">Works</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
              Getting started is simple. Three steps to a world of possibilities.
            </p>
          </m.div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <m.div key={step.step} variants={riseInSoft} custom={i} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-12 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-border to-transparent md:block" />
                )}
                <div className="relative mx-auto mb-6 inline-flex">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-border/50 bg-surface/80 backdrop-blur-sm">
                    <step.icon className="h-8 w-8 text-gold" weight="duotone" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">{step.step}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-text-secondary">{step.description}</p>
              </m.div>
            ))}
          </div>
        </AnimatedSection>

        {/* ── Testimonials ── */}
        <AnimatedSection className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <m.div variants={riseIn} custom={0} className="text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Said quietly, <span className="text-gradient-gold">after</span>.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
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
                <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">Hold one of the first hundred seats.</h2>
                <p className="mx-auto mt-4 max-w-lg text-text-secondary">
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
                <p className="mt-6 text-xs text-text-secondary">18+ only · Your identity stays anonymous · A price that never moves</p>
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
