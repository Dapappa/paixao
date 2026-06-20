"use client";

import { useRouter } from "next/navigation";
import { LazyMotion, domAnimation, m } from "motion/react";
import { ShieldCheck } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { RevealText, VelvetCursor } from "@/components/marketing/motion-primitives";
import { riseIn, stagger } from "@/lib/motion";

export default function AgeGatePage() {
  const router = useRouter();

  function handleEnter() {
    // Set cookie with 30-day expiry
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    document.cookie = `passionden_age_verified=true; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    router.push("/");
  }

  function handleExit() {
    window.location.href = "https://www.google.com";
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-16">
        <VelvetCursor />

        {/* ── Ambient aura backdrop (Velvet Aura) ── */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="aura-field absolute inset-0 animate-aura-drift opacity-70" />
          <div className="absolute left-1/2 top-1/2 h-[680px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.06] blur-[150px]" />
          <div className="absolute bottom-[-12%] right-[-6%] h-[440px] w-[600px] rounded-full bg-gold/[0.05] blur-[130px]" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen blur-[2px]"
            style={{ backgroundImage: "url(/generated/hero-aura.webp)" }}
          />
        </div>

        {/* ── The gate ── */}
        <m.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 flex w-full max-w-lg flex-col items-center text-center"
        >
          {/* Brand mark */}
          <m.span
            variants={riseIn}
            custom={0}
            className="animate-breath font-serif text-3xl font-medium tracking-[0.18em] text-foreground sm:text-4xl"
          >
            PAIX<span className="text-accent">Ã</span>O
          </m.span>

          {/* Eyebrow */}
          <m.span
            variants={riseIn}
            custom={1}
            className="mt-9 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.32em] text-gold sm:text-[13px]"
          >
            <ShieldCheck className="h-4 w-4 text-gold" weight="duotone" />
            Members only, after dark
          </m.span>

          {/* Headline */}
          <RevealText
            className="mt-6 block font-serif text-[clamp(2.25rem,8vw,3.75rem)] font-medium leading-[1.05] tracking-[-0.02em]"
            delay={0.15}
            lines={[
              { text: "You must be", className: "text-foreground" },
              { text: "eighteen to enter.", className: "text-gradient-brand" },
            ]}
          />

          {/* Body copy */}
          <m.p
            variants={riseIn}
            custom={3}
            className="mt-7 max-w-md text-base leading-relaxed text-text-secondary sm:text-lg"
          >
            Beyond this door is an anonymous room for verified adults — candlelit, discreet, and
            intended for those{" "}
            <span className="font-medium text-foreground">18 years of age or older</span>.
          </m.p>

          <m.p
            variants={riseIn}
            custom={4}
            className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary/80"
          >
            By entering, you confirm you are of age and consent to viewing adult content.
          </m.p>

          {/* Gold hairline */}
          <m.div
            variants={riseIn}
            custom={5}
            className="mt-10 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent"
          />

          {/* Actions */}
          <m.div
            variants={riseIn}
            custom={6}
            className="mt-10 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button
              size="lg"
              onClick={handleEnter}
              className="group min-w-[220px] animate-pulse-glow"
            >
              I am 18 or older — Enter
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleExit}
              className="min-w-[160px]"
            >
              I am under 18 — Leave
            </Button>
          </m.div>

          {/* Legal */}
          <m.p
            variants={riseIn}
            custom={7}
            className="mt-10 max-w-md text-[11px] leading-relaxed text-text-secondary/55"
          >
            By proceeding, you agree to our Terms of Service and confirm compliance with all
            applicable laws in your jurisdiction regarding adult content.
          </m.p>
        </m.div>

        {/* ── Atmosphere overlays (fixed, non-interactive) ── */}
        <div className="vignette" aria-hidden />
        <div className="film-grain" aria-hidden />
      </div>
    </LazyMotion>
  );
}
