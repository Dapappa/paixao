"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  Ban,
  Key,
  Phone,
  ExternalLink,
  ChevronRight,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SafetyTips } from "@/components/safety/safety-tips";
import { ReportForm } from "@/components/safety/report-form";
import { SafeWordSetup } from "@/components/safety/safe-word-setup";

/* ─────────────────────────────────────────────
   Quick action cards
   ───────────────────────────────────────────── */

const QUICK_ACTIONS = [
  {
    label: "Report an Issue",
    description: "Report harassment, safety concerns, or policy violations",
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    href: "/safety/report",
  },
  {
    label: "Manage Blocked Users",
    description: "View and manage your blocked users list",
    icon: Ban,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    href: "/safety/blocked",
  },
  {
    label: "Safe Word Setup",
    description: "Configure your safe word and emergency contacts",
    icon: Key,
    color: "text-[#d4a574]",
    bg: "bg-[#d4a574]/10 border-[#d4a574]/20",
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
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */

export function SafetyHubClient() {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8"
    >
      {/* Hero */}
      <motion.div variants={fadeUp} className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c2185b]/10">
          <Shield className="h-8 w-8 text-[#c2185b]" />
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Safety Center
        </h1>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Your safety is our top priority. Use these tools to report issues,
          manage your boundaries, and stay safe in the community.
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
            <div
              className={cn(
                "group flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 transition-all hover:border-zinc-600 hover:bg-zinc-800/30",
                "cursor-pointer"
              )}
            >
              <div
                className={cn(
                  "mb-3 flex h-10 w-10 items-center justify-center rounded-lg border",
                  action.bg
                )}
              >
                <Icon className={cn("h-5 w-5", action.color)} />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-foreground">
                {action.label}
              </h3>
              <p className="flex-1 text-xs text-muted-foreground">
                {action.description}
              </p>
              <ChevronRight className="mt-3 h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-zinc-400" />
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
        className="mb-8 rounded-xl border border-[#c2185b]/20 bg-[#c2185b]/5 p-4"
      >
        <div className="flex items-start gap-3">
          <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#c2185b]" />
          <div>
            <h3 className="mb-1 text-sm font-semibold text-[#c2185b]">
              In Immediate Danger?
            </h3>
            <p className="text-sm text-[#c2185b]/80">
              If you are in immediate physical danger, please contact your local
              emergency services (911) first. The panic button (red shield
              icon) at the bottom of your screen will alert our moderation
              team.
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
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Key className="h-5 w-5 text-[#d4a574]" />
          Safe Word Configuration
        </h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-6">
          <SafeWordSetup />
        </div>
      </motion.div>

      {/* Community Guidelines link */}
      <motion.div variants={fadeUp}>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#d4a574]" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Community Guidelines
                </h3>
                <p className="text-xs text-muted-foreground">
                  Review our standards for respectful, consensual interaction
                </p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-zinc-600" />
          </div>
        </div>
      </motion.div>

      {/* Report dialog (accessible from quick action) */}
      <ReportForm
        asDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
      />
    </motion.div>
  );
}
