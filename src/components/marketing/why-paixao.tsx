"use client";

import Image from "next/image";
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
  Shield,
  CalendarDots,
  Heart,
  HandHeart,
} from "@phosphor-icons/react/ssr";

type IconType = typeof Shield;

/* ------------------------------------------------------------------ */
/* Data — each feature is a cinematic panel with its own media slot.   */
/* `media` points at a still today; drop a .mp4/.gif at the same slot  */
/* later and swap <Image> for <video> — the layout won't move.         */
/* ------------------------------------------------------------------ */

type Feature = {
  icon: IconType;
  index: string;
  kicker: string;
  title: string;
  description: string;
  media: string;
  alt: string;
};

const features: Feature[] = [
  {
    icon: Shield,
    index: "01",
    kicker: "Anonymity",
    title: "Anonymous until you decide",
    description:
      "You stay a stranger as long as you like. A name, a face, a want; each one is yours to offer, never taken. Reveal it on your timing, or never at all.",
    media: "/generated/tier1-desire-blindfold.webp",
    alt: "A figure in a soft blindfold, half-lit, identity withheld by choice",
  },
  {
    icon: CalendarDots,
    index: "02",
    kicker: "The room",
    title: "Rooms worth dressing for",
    description:
      "Hand-picked gatherings for verified members: a candlelit dozen or a full velvet floor. You'll know the guest list is real before you ever walk in.",
    media: "/generated/tier1-events.webp",
    alt: "A warm candlelit gathering room set for a private event",
  },
  {
    icon: Heart,
    index: "03",
    kicker: "The match",
    title: "Wanted for who you are",
    description:
      "No swiping into a blur of strangers. We pair you on the things you'd never put on a first date, the real appetites, so the people who find you actually mean it.",
    media: "/generated/tier1-couple.webp",
    alt: "Two people leaning close in low golden light",
  },
  {
    icon: HandHeart,
    index: "04",
    kicker: "Consent",
    title: "Yes means everything here",
    description:
      "Every touch, every step, every door, opened only by mutual yes. Boundaries set the tempo, and they're honored without a second thought.",
    media: "/generated/tier1-desire-restraint.webp",
    alt: "A hand resting open, an invitation, never a demand",
  },
];

/* ------------------------------------------------------------------ */
/* A single cinematic feature panel                                    */
/* ------------------------------------------------------------------ */

function FeaturePanel({ feature, i }: { feature: Feature; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Scroll progress across the whole panel's pass through the viewport.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax: the media drifts opposite the scroll; the ghost number drifts further.
  const mediaY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-14%", "14%"]);
  const numberY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["38%", "-38%"]);
  const flipped = i % 2 === 1;

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16"
    >
      {/* ── Media slot (GIF/video-ready) ── */}
      {/* Frame stays always-visible (no opacity/clip gate) so the lazy image
          reliably loads + shows on mobile; motion comes from the parallax +
          a soft fade-up that never leaves the image hidden if it fails. */}
      <m.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.05, 0.7, 0.1, 1] }}
        className={`group relative overflow-hidden rounded-3xl border border-border/40 ${
          flipped ? "lg:order-2" : ""
        }`}
      >
        <div className="relative aspect-[4/5] w-full sm:aspect-[5/4] lg:aspect-[4/5]">
          {/* Inner wrapper scales >100% so the parallax shift never reveals an edge. */}
          <m.div style={{ y: mediaY }} className="absolute inset-[-14%]">
            <Image
              src={feature.media}
              alt={feature.alt}
              fill
              loading="eager"
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
            />
          </m.div>

          {/* mood grade + aura glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
          <div className="aura-field absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-700 group-hover:opacity-60" />

          {/* giant ghost index, drifting */}
          <m.span
            style={{ y: numberY }}
            aria-hidden
            className="pointer-events-none absolute -bottom-6 right-2 select-none font-serif text-[10rem] font-bold leading-none text-foreground/[0.08] sm:text-[13rem]"
          >
            {feature.index}
          </m.span>

          {/* floating glass kicker chip */}
          <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-3.5 py-1.5 backdrop-blur-md">
            <feature.icon className="h-4 w-4 text-gold" weight="duotone" />
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/80">
              {feature.kicker}
            </span>
          </div>
        </div>
      </m.div>

      {/* ── Copy ── */}
      <FeatureCopy feature={feature} scrollYProgress={scrollYProgress} flipped={flipped} reduce={!!reduce} />
    </div>
  );
}

function FeatureCopy({
  feature,
  scrollYProgress,
  flipped,
  reduce,
}: {
  feature: Feature;
  scrollYProgress: MotionValue<number>;
  flipped: boolean;
  reduce: boolean;
}) {
  // Copy lifts gently on a slower parallax than the media — a layered, dimensional feel.
  const copyY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["28%", "-12%"]);

  return (
    <m.div
      style={{ y: copyY }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.8, ease: [0.05, 0.7, 0.1, 1], delay: 0.15 }}
      className={flipped ? "lg:order-1 lg:pr-6" : "lg:pl-6"}
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="font-serif text-2xl font-bold text-gold/70">{feature.index}</span>
        <span className="h-px flex-1 max-w-[64px] bg-gradient-to-r from-gold/50 to-transparent" />
      </div>
      <h3 className="font-serif text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl">
        {feature.title}
      </h3>
      <p className="mt-5 max-w-md text-lg leading-relaxed text-text-secondary">
        {feature.description}
      </p>
    </m.div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function WhyPaixao() {
  const headRef = useRef<HTMLDivElement>(null);

  return (
    <LazyMotion features={domAnimation}>
      <section id="features" className="relative z-10 mx-auto max-w-7xl scroll-mt-24 px-4 py-28 sm:px-6 sm:py-40 lg:px-8">
        {/* Heading */}
        <m.div
          ref={headRef}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.05, 0.7, 0.1, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.34em] text-gold/80">
            What makes it ours
          </p>
          <h2 className="font-serif text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Why <span className="text-gradient-brand">Paixão</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
            Built from the ground up around safety, privacy, and pleasure. Every
            detail exists to protect you, and to let you be wanted on your own terms.
          </p>
        </m.div>

        {/* Cinematic panels */}
        <div className="mt-24 space-y-28 sm:space-y-40">
          {features.map((feature, i) => (
            <FeaturePanel key={feature.title} feature={feature} i={i} />
          ))}
        </div>
      </section>
    </LazyMotion>
  );
}
