"use client";

import Link from "next/link";
import { LazyMotion, domAnimation, m } from "motion/react";
import { EyeSlash, SealCheck, Lock } from "@phosphor-icons/react/ssr";
import { RevealText } from "@/components/marketing/motion-primitives";
import { riseIn, stagger } from "@/lib/motion";

/* The three quiet promises that lower the friction of making a seat. */
const TRUST_CUES = [
  { icon: EyeSlash, label: "Anonymous by design" },
  { icon: SealCheck, label: "Verified members only" },
  { icon: Lock, label: "Discreet, always" },
] as const;

/**
 * Velvet Aura presentation shell for the registration screen.
 * Pure presentation — the auth logic lives in <SignupForm>, passed as children.
 */
export function SignupShell({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <div className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden px-4 py-16">
        {/* ── Ambient aura backdrop (Velvet Aura) ── */}
        <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
          <div className="aura-field absolute inset-0 animate-aura-drift opacity-70" />
          <div className="absolute left-1/2 top-1/3 h-[460px] w-[580px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.07] blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-5%] h-[400px] w-[500px] rounded-full bg-gold/[0.05] blur-[120px]" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-screen blur-[2px]"
            style={{ backgroundImage: "url(/generated/hero-aura.webp)" }}
          />
        </div>

        <m.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 w-full max-w-md"
        >
          {/* Wordmark */}
          <m.div variants={riseIn} custom={0} className="mb-9 text-center">
            <Link href="/" className="inline-block">
              <span className="animate-breath font-serif text-2xl font-medium tracking-[0.18em] text-foreground">
                PAIX<span className="text-accent">Ã</span>O
              </span>
            </Link>
          </m.div>

          {/* Header */}
          <div className="mb-9 text-center">
            <m.p
              variants={riseIn}
              custom={1}
              className="mb-4 text-[11px] font-medium uppercase tracking-[0.34em] text-gold sm:text-xs"
            >
              Step inside
            </m.p>
            <RevealText
              className="block font-serif text-[clamp(2.25rem,9vw,3rem)] font-medium leading-[1.05] tracking-[-0.02em]"
              delay={0.1}
              lines={[
                { text: "A door opens.", className: "text-foreground" },
                { text: "Stay a stranger.", className: "text-gradient-brand" },
              ]}
            />
            <m.p
              variants={riseIn}
              custom={3}
              className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-text-secondary"
            >
              Make your seat in under a minute. You stay a stranger until you decide
              otherwise — no real name, no photo, nothing you don&rsquo;t offer first.
            </m.p>
          </div>

          {/* Lounge card */}
          <m.div
            variants={riseIn}
            custom={4}
            className="relative overflow-hidden rounded-2xl border border-border/50 bg-surface/60 p-6 backdrop-blur-md shadow-glow-accent sm:p-8"
          >
            <div className="aura-field pointer-events-none absolute inset-0 opacity-40" aria-hidden />
            <div className="relative">{children}</div>
          </m.div>

          {/* Trust cues — the quiet reassurance, no middots */}
          <m.ul
            variants={riseIn}
            custom={5}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5"
          >
            {TRUST_CUES.map((cue) => (
              <li
                key={cue.label}
                className="inline-flex items-center gap-1.5 text-xs text-text-secondary"
              >
                <cue.icon className="h-3.5 w-3.5 text-gold" weight="light" />
                {cue.label}
              </li>
            ))}
          </m.ul>

          <m.p
            variants={riseIn}
            custom={6}
            className="mt-4 text-center text-xs text-text-secondary/70"
          >
            18+ only. Leave whenever you like.
          </m.p>
        </m.div>

        {/* ── Atmosphere overlays (fixed, non-interactive) ── */}
        <div className="vignette" aria-hidden />
        <div className="film-grain" aria-hidden />
      </div>
    </LazyMotion>
  );
}
