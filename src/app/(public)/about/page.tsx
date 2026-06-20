"use client";

import Link from "next/link";
import { useRef } from "react";
import { LazyMotion, domAnimation, m, useInView } from "motion/react";
import { Shield, Heart, Eye, UsersThree, ArrowRight, Crown } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { RevealText, ParallaxLayer } from "@/components/marketing/motion-primitives";
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

const values = [
  {
    icon: Shield,
    title: "Safety, first and always",
    description:
      "Every feature starts with one question — does this keep you safe? Verified faces, quiet reporting, a room you can trust before you ever let your guard down.",
  },
  {
    icon: Heart,
    title: "Consent, woven in",
    description:
      "Not a checkbox. A rhythm. Boundaries are named out loud here, honoured without question, and the people who can't do that don't stay.",
  },
  {
    icon: Eye,
    title: "Anonymous by design",
    description:
      "Your name is yours to give. Show what you want, to whom you want, when the moment's right — and not a heartbeat sooner.",
  },
  {
    icon: UsersThree,
    title: "Everyone, as they are",
    description:
      "Whoever you are, however you love — there's a seat for you. Respect isn't a policy we wrote. It's the price of the room.",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AboutPage() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="relative min-h-dvh overflow-hidden bg-background">
        {/* ── Ambient aura backdrop (Velvet Aura) ── */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="aura-field absolute inset-0 animate-aura-drift opacity-70" />
          <div className="absolute left-1/2 top-[-10%] h-[640px] w-[820px] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-5%] h-[460px] w-[620px] rounded-full bg-gold/[0.05] blur-[120px]" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen blur-[2px]"
            style={{ backgroundImage: "url(/generated/hero-aura.webp)" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          {/* ── Hero: the human why ── */}
          <m.div initial="hidden" animate="visible" variants={stagger} className="text-center">
            <m.span variants={riseIn} custom={0} className="inline-block text-xs font-medium uppercase tracking-[0.34em] text-gold">
              A note from us
            </m.span>
            <RevealText
              className="mt-5 block font-serif text-[clamp(2.25rem,7vw,3.75rem)] font-medium leading-[1.05] tracking-[-0.02em]"
              delay={0.1}
              lines={[
                { text: "We were tired of", className: "text-foreground" },
                { text: "editing ourselves.", className: "text-gradient-brand" },
              ]}
            />
            <m.p variants={riseIn} custom={2} className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-text-secondary">
              Honestly? We built this because nothing out there felt like us. Every app wanted a performance —
              the right photo, the softened truth, wanting a little less than you actually do. We wanted one
              room where you could set all that down at the door. So a few of us made it.
            </m.p>

            <m.p variants={riseIn} custom={3} className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-text-secondary/80">
              A members-only, anonymous room for verified adults — candlelit events and quiet
              matchmaking, on your terms, with your name yours to give.
            </m.p>

            <m.div variants={riseIn} custom={4} className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="group min-w-[200px] animate-pulse-glow">
                <Link href="/founding">
                  Request your invite
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" weight="bold" />
                </Link>
              </Button>
              <span className="inline-flex items-center gap-2 text-sm text-gold/90">
                <Crown className="h-4 w-4" weight="fill" />
                Founding seats from CA$39, the first 100 only
              </span>
            </m.div>
          </m.div>

          {/* ── Atmosphere band — a real couple, with a pull-quote ── */}
          <AnimatedSection className="mt-20">
            <m.div
              variants={riseIn}
              custom={0}
              className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border/40 sm:aspect-[3/4]"
            >
              <ParallaxLayer
                src="/generated/real-couple.webp"
                alt="A couple laughing together on their bed under warm fairy lights"
                sizes="(max-width: 896px) 100vw, 896px"
                kenBurns
              />
              {/* legibility + mood grade */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-end p-6 sm:p-12">
                <div className="max-w-md">
                  <p className="font-serif text-2xl italic leading-snug text-foreground sm:text-3xl">
                    &ldquo;I spent years editing myself on every other app. Three weeks in here and I&apos;d
                    already said the things I never say out loud.&rdquo;
                  </p>
                  <p className="mt-4 text-xs uppercase tracking-[0.25em] text-gold/90">
                    A member · Calgary
                  </p>
                </div>
              </div>
            </m.div>
          </AnimatedSection>

          {/* ── The why, told plainly — copy beside a real persona ── */}
          <AnimatedSection className="mt-20">
            <div className="grid items-stretch gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <m.div
                variants={riseIn}
                custom={0}
                className="rounded-2xl border border-border/50 bg-surface/40 p-8 backdrop-blur-sm sm:p-12"
              >
                <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
                  What we&apos;re really after
                </h2>
                <div className="mt-6 space-y-4 leading-relaxed text-text-secondary">
                  <p>
                    We think adult connection should feel safe, warm, and completely yours. And we got fed up
                    with how many places treat your privacy as fine print and your consent as a box to tick.
                    We couldn&apos;t sit with that, so we went and built the opposite.
                  </p>
                  <p>
                    This is just a room — a real one — where you can be honest about what you want. Explore it,
                    find people who want it too, fall into a slow night that asks nothing of you but to show up.
                    And the whole time, you decide who ever learns your name.
                  </p>
                  <p>
                    Every call we make comes back to three words:{" "}
                    <span className="font-medium text-foreground">anonymity</span>,{" "}
                    <span className="font-medium text-foreground">consent</span>, and{" "}
                    <span className="font-medium text-foreground">safety</span>. If something breaks one of
                    them, it doesn&apos;t ship. Simple as that.
                  </p>
                </div>
              </m.div>

              <m.div
                variants={riseIn}
                custom={1}
                className="relative min-h-[280px] overflow-hidden rounded-2xl border border-border/40"
              >
                <ParallaxLayer
                  src="/generated/real-persona-w.webp"
                  alt="A member at home, face turned away, lit by a lamp"
                  sizes="(max-width: 1024px) 100vw, 360px"
                  kenBurns
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              </m.div>
            </div>
          </AnimatedSection>

          {/* ── Values ── */}
          <AnimatedSection className="mt-20">
            <m.h2
              variants={riseIn}
              custom={0}
              className="text-center font-serif text-2xl font-bold text-foreground sm:text-3xl"
            >
              What we hold <span className="text-gradient-gold">close</span>
            </m.h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {values.map((value, i) => (
                <m.div
                  key={value.title}
                  variants={riseInSoft}
                  custom={i + 1}
                  className="group rounded-2xl border border-border/50 bg-surface/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:bg-surface/80 hover:shadow-glow-accent"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-accent-muted p-3">
                    <value.icon className="h-5 w-5 text-accent" weight="duotone" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{value.description}</p>
                </m.div>
              ))}
            </div>
          </AnimatedSection>

          {/* ── The vision — over a quiet, real-room backdrop ── */}
          <AnimatedSection className="mt-20">
            <m.div
              variants={riseIn}
              custom={0}
              className="relative overflow-hidden rounded-3xl border border-border/40"
            >
              <ParallaxLayer
                src="/generated/real-ambiance.webp"
                alt="A cozy bedroom at night, wine and a lit candle on the table"
                sizes="(max-width: 896px) 100vw, 896px"
              />
              <div className="absolute inset-0 bg-background/80" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/70" />
              <div className="relative px-6 py-16 text-center sm:px-12 sm:py-20">
                <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
                  Where this goes
                </h2>
                <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-text-secondary">
                  We want adult spaces held to a higher standard — kinder, safer, more beautiful than anyone
                  bothered to make them before. Paixão isn&apos;t a product we&apos;re trying to scale. It&apos;s
                  the quieter, more respectful place we wished existed, built for adults to meet on their own terms.
                </p>
                <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-text-secondary">
                  We genuinely believe technology should hold you, not use you. We&apos;ll keep it honest, keep
                  listening to you, and keep making this room worth stepping into. Thanks for being here early.
                </p>
                <p className="mt-7 font-serif text-lg italic text-foreground/90">
                  — the people behind Paixão
                </p>

                <div className="mt-10 flex flex-col items-center gap-4">
                  <Button size="lg" asChild className="group min-w-[210px] animate-pulse-glow">
                    <Link href="/founding">
                      Claim a founding seat
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" weight="bold" />
                    </Link>
                  </Button>
                  <p className="text-xs text-text-secondary">
                    A lifetime seat at CA$39 — the price never moves, and the first hundred never reopen.
                  </p>
                </div>
              </div>
            </m.div>
          </AnimatedSection>
        </div>

        {/* ── Atmosphere overlays (fixed, non-interactive) ── */}
        <div className="vignette" aria-hidden />
        <div className="film-grain" aria-hidden />
      </div>
    </LazyMotion>
  );
}
