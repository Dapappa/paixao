"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Warning,
  Prohibit,
  Key,
  Phone,
  ArrowSquareOut,
  CaretRight,
  FileText,
} from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { SafetyTips } from "@/components/safety/safety-tips";
import { ReportForm } from "@/components/safety/report-form";
import { SafeWordSetup } from "@/components/safety/safe-word-setup";

/* ─────────────────────────────────────────────
   Quick action cards
   ───────────────────────────────────────────── */

const QUICK_ACTIONS = [
  {
    label: "Speak up",
    description: "Something felt off? Tell us quietly. We'll handle it with care.",
    icon: Warning,
    color: "text-accent",
    bg: "bg-accent-muted border-accent/20",
    href: "/safety/report",
  },
  {
    label: "Who you've shut out",
    description: "See the people you've blocked, and open or close that door anytime.",
    icon: Prohibit,
    color: "text-gold",
    bg: "bg-gold-muted border-gold/20",
    href: "/safety/blocked",
  },
  {
    label: "Your safe word",
    description: "Set a word that's yours alone, and the people who'll come if you say it.",
    icon: Key,
    color: "text-gold",
    bg: "bg-gold-muted border-gold/20",
    href: "#safe-word",
  },
];

/* ─────────────────────────────────────────────
   Container animation
   ───────────────────────────────────────────── */

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.05, 0.7, 0.1, 1] as const } },
};

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */

export function SafetyHubClient() {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
      {/* ── Ambient aura backdrop (Velvet Aura) ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.16] mix-blend-screen"
          style={{ backgroundImage: "url(/generated/bg-bar.webp)" }}
        />
        <div className="aura-field absolute inset-0 animate-aura-drift opacity-60" />
        <div className="absolute left-1/2 top-[-10%] h-[460px] w-[640px] -translate-x-1/2 rounded-full bg-accent/[0.06] blur-[130px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-3xl"
      >
        {/* Hero */}
        <motion.div variants={fadeUp} className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 animate-breath items-center justify-center rounded-2xl border border-accent/20 bg-accent-muted">
            <Shield weight="duotone" className="h-8 w-8 text-accent" />
          </div>
          <span className="text-xs font-medium uppercase tracking-[0.34em] text-gold">
            Held, not watched
          </span>
          <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            You&apos;re looked after here
          </h1>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-text-secondary">
            However close the night gets, the door stays yours. These are the
            quiet tools that keep it that way — set your boundaries, name what&apos;s
            wrong, and we&apos;ll move on it.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={fadeUp}
          className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            const isAnchor = action.href.startsWith("#");

            const content = (
              <div className="group flex h-full cursor-pointer flex-col rounded-2xl border border-border/50 bg-surface/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:bg-surface/80 hover:shadow-glow-accent">
                <div
                  className={cn(
                    "mb-3 flex h-10 w-10 items-center justify-center rounded-lg border",
                    action.bg
                  )}
                >
                  <Icon weight="light" className={cn("h-5 w-5", action.color)} />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">
                  {action.label}
                </h3>
                <p className="flex-1 text-xs leading-relaxed text-text-secondary">
                  {action.description}
                </p>
                <CaretRight weight="bold" className="mt-3 h-4 w-4 text-text-secondary transition-transform group-hover:translate-x-1 group-hover:text-gold" />
              </div>
            );

            if (isAnchor) {
              return (
                <a key={action.label} href={action.href}>
                  {content}
                </a>
              );
            }

            return (
              <Link key={action.label} href={action.href}>
                {content}
              </Link>
            );
          })}
        </motion.div>

        {/* Emergency info */}
        <motion.div
          variants={fadeUp}
          className="mb-8 rounded-2xl border border-accent/20 bg-accent/5 p-5 backdrop-blur-sm"
        >
          <div className="flex items-start gap-3">
            <Phone weight="light" className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <h3 className="mb-1 text-sm font-semibold text-foreground">
                If you&apos;re in danger right now
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                Your safety comes before anything on this screen. If you&apos;re in
                immediate physical danger, call your local emergency services
                (911) first. The red shield at the bottom of your screen reaches
                our team in a heartbeat.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Safety tips */}
        <motion.div variants={fadeUp} className="mb-8">
          <SafetyTips context="general" defaultOpen />
        </motion.div>

        {/* Safe Word Setup */}
        <motion.div variants={fadeUp} className="mb-8" id="safe-word">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold text-foreground">
            <Key weight="light" className="h-5 w-5 text-gold" />
            A word that&apos;s only yours
          </h2>
          <div className="rounded-2xl border border-border/50 bg-surface/50 p-4 backdrop-blur-sm sm:p-6">
            <SafeWordSetup />
          </div>
        </motion.div>

        {/* Community Guidelines link */}
        <motion.div variants={fadeUp}>
          <Link href="/guidelines">
            <div className="group rounded-2xl border border-border/50 bg-surface/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:bg-surface/80 hover:shadow-glow-accent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText weight="light" className="h-5 w-5 text-gold" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      How we treat each other
                    </h3>
                    <p className="text-xs text-text-secondary">
                      The few things we ask of everyone in the room — consent first, always.
                    </p>
                  </div>
                </div>
                <ArrowSquareOut weight="bold" className="h-4 w-4 text-text-secondary transition-colors group-hover:text-gold" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Report dialog (accessible from quick action) */}
        <ReportForm asDialog open={reportOpen} onOpenChange={setReportOpen} />
      </motion.div>

      {/* ── Atmosphere overlays ── */}
      <div className="vignette" aria-hidden />
      <div className="film-grain" aria-hidden />
    </div>
  );
}
