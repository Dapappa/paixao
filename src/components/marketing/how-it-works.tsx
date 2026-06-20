"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import {
  UserPlus,
  MagnifyingGlass,
  ChatCircle,
} from "@phosphor-icons/react/ssr";

type IconType = typeof UserPlus;

type Step = {
  icon: IconType;
  step: string;
  title: string;
  description: string;
  media: string;
  alt: string;
};

const steps: Step[] = [
  {
    icon: UserPlus,
    step: "01",
    title: "Slip in unseen",
    description:
      "Sign up anonymous. Build the version of you that you actually want met — keep the rest under wraps until you say otherwise.",
    media: "/generated/tier1-desire-blindfold.webp",
    alt: "A figure half-lit, identity withheld",
  },
  {
    icon: MagnifyingGlass,
    step: "02",
    title: "Read the room",
    description:
      "Wander the events, the profiles, the quiet corners. See who lingers on you, and notice who you can't stop coming back to.",
    media: "/generated/real-ambiance.webp",
    alt: "A warm, low-lit room alive with possibility",
  },
  {
    icon: ChatCircle,
    step: "03",
    title: "Lean in",
    description:
      "A first message, a held glance, an invitation across the floor. Move at your own pace — every step waits for your yes.",
    media: "/generated/tier1-couple.webp",
    alt: "Two people leaning close in golden light",
  },
];

const TOTAL = steps.length;

/* One full-stage layer, crossfaded by the pinned scroll progress. */
function StepLayer({
  step,
  i,
  progress,
  reduce,
}: {
  step: Step;
  i: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const seg = 1 / TOTAL;
  const inAt = i / TOTAL;
  const outAt = (i + 1) / TOTAL;

  // Crossfade windows, clamped to [0,1] so the scroll-driven offsets stay
  // monotonic. Motion's WAAPI path turns this input range into keyframe
  // offsets, which must be non-decreasing and within [0,1] — out-of-range
  // sentinels (-1 / 2) throw "Offsets must be monotonically non-decreasing".
  const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
  const fadeInStart = clamp01(inAt - seg * 0.35);
  const fadeInEnd = clamp01(inAt + seg * 0.18);
  const fadeOutStart = clamp01(outAt - seg * 0.18);
  const fadeOutEnd = clamp01(outAt + seg * 0.35);

  // First layer is live at the very top; last stays to the very bottom.
  const opacity = useTransform(
    progress,
    i === 0
      ? [0, fadeOutStart, fadeOutEnd]
      : i === TOTAL - 1
        ? [fadeInStart, fadeInEnd, 1]
        : [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    i === 0 ? [1, 1, 0] : i === TOTAL - 1 ? [0, 1, 1] : [0, 1, 1, 0]
  );

  // The active window, normalised 0→1, drives the in-layer motion.
  const local = useTransform(progress, [inAt, outAt], [0, 1]);
  const mediaScale = useTransform(local, [0, 1], reduce ? [1, 1] : [1.16, 1.02]);
  const mediaY = useTransform(local, [0, 1], reduce ? ["0%", "0%"] : ["8%", "-8%"]);
  const numberY = useTransform(local, [0, 1], reduce ? ["0%", "0%"] : ["18%", "-18%"]);
  const copyY = useTransform(local, [0, 1], reduce ? ["0%", "0%"] : ["44px", "-20px"]);

  return (
    <m.div style={{ opacity }} className="absolute inset-0 flex items-center">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Media */}
        <div className="relative order-1 overflow-hidden rounded-[2rem] border border-border/40">
          <div className="relative aspect-[16/11] w-full sm:aspect-[16/10]">
            <m.div style={{ y: mediaY, scale: mediaScale }} className="absolute inset-[-8%]">
              <Image
                src={step.media}
                alt={step.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 640px"
                className="object-cover"
              />
            </m.div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
            <div className="aura-field absolute inset-0 opacity-40 mix-blend-screen" />
            <m.span
              style={{ y: numberY }}
              aria-hidden
              className="pointer-events-none absolute -bottom-10 -right-2 select-none font-serif text-[11rem] font-bold leading-none text-foreground/[0.07] sm:text-[16rem]"
            >
              {step.step}
            </m.span>
          </div>
        </div>

        {/* Copy */}
        <m.div style={{ y: copyY }} className="order-2 text-center lg:text-left">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/30 bg-surface/80 shadow-glow-gold backdrop-blur-sm">
            <step.icon className="h-8 w-8 text-gold" weight="duotone" />
          </div>
          <p className="mb-3 font-serif text-xl font-bold text-gold/70">{step.step}</p>
          <h3 className="font-serif text-5xl font-medium leading-[1.04] tracking-[-0.02em] text-foreground sm:text-6xl">
            {step.title}
          </h3>
          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-text-secondary lg:mx-0">
            {step.description}
          </p>
        </m.div>
      </div>
    </m.div>
  );
}

/* Mobile: a clean stacked step — no pin, no absolute layers, no overlap. */
function MobileStep({ step }: { step: Step }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.7, ease: [0.05, 0.7, 0.1, 1] }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border/40">
        <Image src={step.media} alt={step.alt} fill sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
        <div className="aura-field absolute inset-0 opacity-30 mix-blend-screen" />
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-1 right-3 select-none font-serif text-[6rem] font-medium leading-none text-foreground/10"
        >
          {step.step}
        </span>
        <div className="absolute left-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/30 bg-background/50 backdrop-blur-md">
          <step.icon className="h-6 w-6 text-gold" weight="duotone" />
        </div>
      </div>
      <div className="mt-5">
        <p className="mb-2 font-serif text-lg font-medium text-gold/70">{step.step}</p>
        <h3 className="font-serif text-3xl font-medium leading-[1.05] tracking-[-0.01em] text-foreground">
          {step.title}
        </h3>
        <p className="mt-3 text-base leading-relaxed text-text-secondary">{step.description}</p>
      </div>
    </m.div>
  );
}

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  // Pin scrub: 0 when the tall track's top hits the viewport top, 1 at its bottom.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(TOTAL - 1, Math.max(0, Math.floor(v * TOTAL + 0.0001)));
    setActive(idx);
  });

  const railFill = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <LazyMotion features={domAnimation}>
      {/* ── Mobile / tablet: stacked, no pin (avoids the cramped-viewport overlap) ── */}
      <section className="relative z-10 px-4 py-24 sm:px-6 lg:hidden">
        <div className="mb-14">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.34em] text-gold/80">
            From stranger to wanted
          </p>
          <h2 className="font-serif text-4xl font-medium leading-[1.04] tracking-[-0.02em] sm:text-5xl">
            How it <span className="text-gradient-gold">works</span>
          </h2>
        </div>
        <div className="space-y-16">
          {steps.map((step) => (
            <MobileStep key={step.step} step={step} />
          ))}
        </div>
      </section>

      {/* ── Desktop: pinned scroll-scrub. Tall track creates the scrub distance. ── */}
      <section
        ref={ref}
        className="relative z-10 hidden lg:block"
        style={{ height: `${TOTAL * 100}vh` }}
      >
        <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
          {/* Persistent header */}
          <div className="mx-auto flex w-full max-w-7xl items-end justify-between px-4 pt-24 sm:px-6 lg:px-8">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.34em] text-gold/80">
                From stranger to wanted
              </p>
              <h2 className="font-serif text-5xl font-medium leading-[1.04] tracking-[-0.02em] sm:text-6xl">
                How it <span className="text-gradient-gold">works</span>
              </h2>
            </div>
            <div className="hidden font-serif text-text-secondary sm:block">
              <span className="text-3xl font-bold text-foreground">{steps[active].step}</span>
              <span className="text-lg"> / 0{TOTAL}</span>
            </div>
          </div>

          {/* Stage — layers crossfade through it */}
          <div className="relative flex-1">
            {steps.map((step, i) => (
              <StepLayer key={step.step} step={step} i={i} progress={scrollYProgress} reduce={!!reduce} />
            ))}
          </div>

          {/* Progress rail */}
          <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            <div className="relative h-px w-full overflow-hidden rounded-full bg-border/50">
              <m.div
                style={{ scaleX: railFill, transformOrigin: "left" }}
                className="h-full w-full bg-gradient-to-r from-gold via-accent to-gold"
              />
            </div>
            <div className="mt-4 flex justify-between">
              {steps.map((step, i) => (
                <button
                  key={step.step}
                  type="button"
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    i <= active ? "text-foreground" : "text-text-secondary/50"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full transition-all ${
                      i === active
                        ? "scale-125 bg-gold shadow-glow-gold"
                        : i < active
                          ? "bg-accent"
                          : "bg-border"
                    }`}
                  />
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
