import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { RevealText } from "@/components/marketing/motion-primitives";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log In",
  description: "Sign in to your Paixão account.",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden px-4 py-20">
      {/* ── Ambient aura backdrop (Velvet Aura) ── */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="aura-field absolute inset-0 animate-aura-drift opacity-70" />
        <div className="absolute left-1/2 top-[24%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.06] blur-[140px]" />
        <div className="absolute bottom-[-12%] right-[-8%] h-[420px] w-[520px] rounded-full bg-gold/[0.05] blur-[130px]" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-screen blur-[2px]"
          style={{ backgroundImage: "url(/generated/hero-aura.webp)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* ── Header ── */}
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex items-center justify-center">
            <span className="animate-breath font-serif text-2xl font-medium tracking-[0.18em] text-foreground">
              PAIX<span className="text-accent">Ã</span>O
            </span>
          </Link>

          <span className="mt-8 block text-[11px] font-medium uppercase tracking-[0.34em] text-gold">
            Members only
          </span>

          <RevealText
            className="mt-4 block font-serif text-[clamp(2.25rem,7vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.02em]"
            delay={0.1}
            lines={[
              { text: "Welcome", className: "text-foreground" },
              { text: "back.", className: "text-gradient-brand" },
            ]}
          />

          <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-text-secondary">
            The room&apos;s warm and waiting. Slip back in — quietly, on your terms.
          </p>
        </div>

        {/* ── Card ── */}
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-surface/50 p-7 shadow-lg backdrop-blur-md sm:p-9">
          <div className="aura-field pointer-events-none absolute inset-0 opacity-40" aria-hidden />
          <div className="relative">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
        </div>

        <p className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-center text-xs text-text-secondary">
          <span>18+ only</span>
          <span>Your identity stays yours</span>
          <span>Discreet, always</span>
        </p>
      </div>

      {/* ── Atmosphere overlays (fixed, non-interactive) ── */}
      <div className="vignette" aria-hidden />
      <div className="film-grain" aria-hidden />
    </div>
  );
}
