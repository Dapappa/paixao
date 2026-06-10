"use client";

import Link from "next/link";
import { LazyMotion, domAnimation, m } from "motion/react";
import { ShieldCheck } from "@phosphor-icons/react/ssr";
import { riseIn, stagger } from "@/lib/motion";

/**
 * Velvet Aura presentation shell for the registration screen.
 * Pure presentation — the auth logic lives in <SignupForm>, passed as children.
 */
export function SignupShell({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <div className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
        {/* ── Ambient aura backdrop (Velvet Aura) ── */}
        <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
          <div className="aura-field absolute inset-0 animate-aura-drift opacity-70" />
          <div className="absolute left-1/2 top-1/3 h-[440px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.06] blur-[130px]" />
          <div className="absolute bottom-[-10%] right-[-5%] h-[380px] w-[480px] rounded-full bg-gold/[0.05] blur-[120px]" />
        </div>

        <m.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 w-full max-w-md"
        >
          {/* Wordmark */}
          <m.div variants={riseIn} custom={0} className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <span className="animate-breath font-serif text-2xl font-bold tracking-wider text-foreground">
                PAIX<span className="text-accent">Ã</span>O
              </span>
            </Link>
          </m.div>

          {/* Header */}
          <div className="mb-8 text-center">
            <m.p
              variants={riseIn}
              custom={1}
              className="mb-3 text-xs font-medium uppercase tracking-[0.34em] text-text-secondary"
            >
              Step inside
            </m.p>
            <m.h1
              variants={riseIn}
              custom={2}
              className="font-serif text-4xl font-bold leading-[1.1] tracking-tight"
            >
              <span className="text-foreground">A door opens.</span>
              <br />
              <span className="text-gradient-brand">Stay a stranger.</span>
            </m.h1>
            <m.p
              variants={riseIn}
              custom={3}
              className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-text-secondary"
            >
              Make your seat. You stay a stranger until you decide otherwise —
              no real name, no photo, nothing you don&rsquo;t offer first.
            </m.p>
          </div>

          {/* Lounge card */}
          <m.div
            variants={riseIn}
            custom={4}
            className="relative overflow-hidden rounded-2xl border border-border/50 bg-surface/60 p-6 backdrop-blur-md sm:p-8"
          >
            <div className="aura-field pointer-events-none absolute inset-0 opacity-40" aria-hidden />
            <div className="relative">{children}</div>
          </m.div>

          {/* Reassurance footnote */}
          <m.div
            variants={riseIn}
            custom={5}
            className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-text-secondary"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-gold" weight="light" />
            <span>18+ only · Anonymous by design · Leave whenever you like</span>
          </m.div>
        </m.div>

        {/* ── Atmosphere overlays (fixed, non-interactive) ── */}
        <div className="vignette" aria-hidden />
        <div className="film-grain" aria-hidden />
      </div>
    </LazyMotion>
  );
}
