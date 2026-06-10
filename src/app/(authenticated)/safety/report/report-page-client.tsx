"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, CaretLeft } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { ReportForm } from "@/components/safety/report-form";

export function ReportPageClient() {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
      {/* ── Ambient aura backdrop (Velvet Aura) ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.16] mix-blend-screen"
          style={{ backgroundImage: "url(/generated/bg-bar.webp)" }}
        />
        <div className="aura-field absolute inset-0 animate-aura-drift opacity-60" />
        <div className="absolute left-1/2 top-[-10%] h-[420px] w-[560px] -translate-x-1/2 rounded-full bg-accent/[0.06] blur-[120px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.05, 0.7, 0.1, 1] as const }}
        className="relative z-10 mx-auto max-w-2xl"
      >
        {/* Back link */}
        <Link href="/safety">
          <Button variant="ghost" size="sm" className="mb-4 text-text-secondary">
            <CaretLeft weight="bold" className="mr-1 h-4 w-4" />
            Safety Center
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-7">
          <div className="mb-3 flex items-center gap-2">
            <Shield weight="light" className="h-6 w-6 text-accent" />
            <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Tell us what happened
            </h1>
          </div>
          <p className="leading-relaxed text-text-secondary">
            This stays between us. Every word reaches a real person on our team,
            and we&apos;ll look into it within a day — no judgment, no noise, just
            care.
          </p>
        </div>

        {/* Full-page report form */}
        <div className="rounded-2xl border border-border/50 bg-surface/50 p-4 backdrop-blur-sm sm:p-6">
          <ReportForm asDialog={false} />
        </div>
      </motion.div>

      {/* ── Atmosphere overlays ── */}
      <div className="vignette" aria-hidden />
      <div className="film-grain" aria-hidden />
    </div>
  );
}
