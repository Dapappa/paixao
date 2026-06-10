import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log In",
  description: "Sign in to your Paixão account.",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden px-4 py-16">
      {/* ── Ambient aura backdrop (Velvet Aura) ── */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="aura-field absolute inset-0 animate-aura-drift opacity-60" />
        <div className="absolute left-1/2 top-[28%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.06] blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-8%] h-[380px] w-[480px] rounded-full bg-gold/[0.05] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* ── Header ── */}
        <div className="mb-9 text-center">
          <Link href="/" className="inline-flex items-center justify-center">
            <span className="animate-breath font-serif text-2xl font-bold tracking-wider text-foreground">
              PAIX<span className="text-accent">Ã</span>O
            </span>
          </Link>

          <h1 className="mt-7 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Welcome back.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            The room&apos;s warm and waiting. Slip back in.
          </p>
        </div>

        {/* ── Card ── */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface/60 p-7 backdrop-blur-md shadow-lg sm:p-9">
          <div className="aura-field pointer-events-none absolute inset-0 opacity-40" aria-hidden />
          <div className="relative">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
        </div>

        <p className="mt-7 text-center text-xs text-text-secondary">
          18+ only · Your identity stays yours · Discreet, always
        </p>
      </div>

      {/* ── Atmosphere overlays (fixed, non-interactive) ── */}
      <div className="vignette" aria-hidden />
      <div className="film-grain" aria-hidden />
    </div>
  );
}
