"use client";

import { useState } from "react";
import { Shield, CaretDown } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
   Contextual tips
   ───────────────────────────────────────────── */

const TIPS: Record<string, { title: string; tips: string[] }> = {
  general: {
    title: "General Safety Tips",
    tips: [
      "Never share personal financial information with anyone you meet on the platform.",
      "Trust your instincts — if something feels off, it probably is.",
      "Set up your safe word in Safety Settings so you can quickly get help.",
      "Always meet new people in public spaces or at verified community events.",
      "Tell a trusted friend where you are going and who you are meeting.",
      "Consent can be withdrawn at any time — yours and theirs.",
      "Report any behavior that makes you uncomfortable. All reports are confidential.",
    ],
  },
  event: {
    title: "Event Safety Tips",
    tips: [
      "Review the event rules and consent requirements before attending.",
      "Have a buddy system — attend events with someone you trust.",
      "Know where the exits are and have a plan to leave if needed.",
      "Check in with the event host or dungeon monitor if you feel unsafe.",
      "Negotiate boundaries before any scene or interaction.",
      "Stay sober enough to make informed decisions about consent.",
      "Use the panic button if you feel you are in danger at any time.",
    ],
  },
  match: {
    title: "Meeting Your Match Safely",
    tips: [
      "Take your time — there is no rush to meet in person.",
      "Video call before meeting face-to-face to verify identity.",
      "Share your plans with a trusted friend, including location and time.",
      "Meet in a public place for the first time.",
      "Arrange your own transportation — do not depend on your date for a ride.",
      "Block and report anyone who pressures you to skip safety steps.",
    ],
  },
  message: {
    title: "Safe Messaging Practices",
    tips: [
      "Do not share personal details like your home address or workplace early on.",
      "Be cautious of people who refuse to video call or always have excuses.",
      "Screen for red flags: love-bombing, guilt-tripping, or boundary-pushing.",
      "Trust your gut — if a conversation makes you uncomfortable, end it.",
      "Report harassing or threatening messages immediately.",
      "Remember: consent applies to digital interactions too.",
    ],
  },
};

/* ─────────────────────────────────────────────
   Props
   ───────────────────────────────────────────── */

interface SafetyTipsProps {
  context: "event" | "match" | "message" | "general";
  className?: string;
  defaultOpen?: boolean;
}

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */

export function SafetyTips({
  context,
  className,
  defaultOpen = false,
}: SafetyTipsProps) {
  const [open, setOpen] = useState(defaultOpen);
  const data = TIPS[context] || TIPS.general;

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-zinc-800/30"
      >
        <div className="flex items-center gap-2">
          <Shield weight="light" className="h-4 w-4 text-[#d4a574]" />
          <span className="text-sm font-medium text-foreground">
            {data.title}
          </span>
        </div>
        <CaretDown
          weight="bold"
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-zinc-800 px-4 py-3">
              <ul className="space-y-2">
                {data.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4a574]" />
                    <span className="text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
