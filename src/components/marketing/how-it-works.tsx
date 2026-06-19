"use client";

import { useRef } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  useScroll,
  useTransform,
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
};

const steps: Step[] = [
  {
    icon: UserPlus,
    step: "01",
    title: "Slip in unseen",
    description:
      "Sign up anonymous. Build the version of you that you actually want met — keep the rest under wraps until you say otherwise.",
  },
  {
    icon: MagnifyingGlass,
    step: "02",
    title: "Read the room",
    description:
      "Wander the events, the profiles, the quiet corners. See who lingers on you, and notice who you can't stop coming back to.",
  },
  {
    icon: ChatCircle,
    step: "03",
    title: "Lean in",
    description:
      "A first message, a held glance, an invitation across the floor. Move at your own pace — every step waits for your yes.",
  },
];

/* A single step node. It "activates" (icon glows, ring fills) as the scroll
   line draws past its position. */
function StepNode({
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
  // Each node owns a slice of the line. It activates as the draw reaches it.
  const at = (i + 0.5) / steps.length;
  const span = 0.16;
  const fill = useTransform(progress, [at - span, at], [0, 1]);

  const ringOpacity = useTransform(fill, [0, 1], [0.25, 1]);
  const ringScale = useTransform(fill, [0, 1], reduce ? [1, 1] : [0.82, 1]);
  const glow = useTransform(
    fill,
    [0, 1],
    ["0 0 0px rgba(212,165,116,0)", "0 0 32px rgba(212,165,116,0.45)"]
  );
  const iconColor = useTransform(fill, [0, 1], ["#a3a3a3", "#d4a574"]);

  return (
    <div className="relative flex flex-col items-center text-center">
      <m.div
        style={{ scale: ringScale, opacity: ringOpacity, boxShadow: glow }}
        className="relative z-10 mb-7 flex h-28 w-28 items-center justify-center rounded-3xl border border-gold/30 bg-surface/90 backdrop-blur-sm"
      >
        <m.div style={{ color: iconColor }}>
          <step.icon className="h-10 w-10" weight="duotone" />
        </m.div>
        <span className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent font-serif text-sm font-bold text-white shadow-glow-accent">
          {step.step}
        </span>
      </m.div>

      <m.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.05, 0.7, 0.1, 1], delay: i * 0.1 }}
      >
        <h3 className="mb-3 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          {step.title}
        </h3>
        <p className="mx-auto max-w-xs text-base leading-relaxed text-text-secondary">
          {step.description}
        </p>
      </m.div>
    </div>
  );
}

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Draw the line as the row scrolls through the middle of the viewport.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 60%"],
  });

  // Horizontal line (desktop) draws left→right; vertical line (mobile) top→bottom.
  const drawX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-40 lg:px-8">
        <m.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.05, 0.7, 0.1, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.34em] text-gold/80">
            From stranger to wanted
          </p>
          <h2 className="font-serif text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            How it <span className="text-gradient-gold">works</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
            Three steps, taken entirely at your pace. Nothing happens before you
            choose it.
          </p>
        </m.div>

        <div ref={ref} className="relative mt-24">
          {/* ── The drawing line ── */}
          {/* Desktop: horizontal, behind the node row */}
          <div className="pointer-events-none absolute left-0 right-0 top-14 hidden md:block">
            <div className="mx-auto h-px w-[78%] overflow-hidden rounded-full bg-border/50">
              <m.div
                style={{ scaleX: drawX, transformOrigin: "left" }}
                className="h-full w-full bg-gradient-to-r from-gold via-accent to-gold"
              />
            </div>
          </div>
          {/* Mobile: vertical line down the centre */}
          <div className="pointer-events-none absolute bottom-12 left-1/2 top-12 w-px -translate-x-1/2 overflow-hidden bg-border/50 md:hidden">
            <m.div
              style={{ scaleY: drawX, transformOrigin: "top" }}
              className="h-full w-full bg-gradient-to-b from-gold via-accent to-gold"
            />
          </div>

          <div className="relative grid gap-16 md:grid-cols-3 md:gap-8">
            {steps.map((step, i) => (
              <StepNode key={step.step} step={step} i={i} progress={scrollYProgress} reduce={!!reduce} />
            ))}
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
