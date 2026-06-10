"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeSlash, Lock } from "@phosphor-icons/react/ssr";
import { type ContentLevel, CONTENT_LEVEL_LABEL } from "@/lib/nsfw";
import { useNsfw } from "@/lib/hooks/use-nsfw";
import { cn } from "@/lib/utils";

/**
 * Consent-first content gate. If the member's view level doesn't reach
 * `level`, the children are blurred behind a tasteful reveal prompt. Revealing
 * is explicit and reversible.
 *
 * Usage:
 *   <NsfwGate level="explicit" label="Members' floor">
 *     <ExplicitGallery ... />
 *   </NsfwGate>
 *
 * For Tier-2 (explicit) this should ALSO be guarded server-side by
 * age-verification status before the content URLs are ever sent to the client.
 */
export function NsfwGate({
  level,
  label,
  children,
  className,
  /** Reveal just this instance (true) vs. opt the whole account up (false). */
  oneTime = true,
}: {
  level: ContentLevel;
  label?: string;
  children: React.ReactNode;
  className?: string;
  oneTime?: boolean;
}) {
  const { canView, revealUpTo } = useNsfw();
  const [localRevealed, setLocalRevealed] = useState(false);

  const revealed = canView(level) || localRevealed;

  function reveal() {
    if (oneTime) setLocalRevealed(true);
    else revealUpTo(level);
  }

  function hideAgain() {
    setLocalRevealed(false);
  }

  return (
    <div className={cn("relative overflow-hidden rounded-2xl", className)}>
      {/* the content — blurred + dimmed until revealed */}
      <div
        className={cn(
          "transition-all duration-500",
          revealed ? "blur-0 opacity-100" : "pointer-events-none select-none blur-2xl opacity-60",
        )}
        aria-hidden={!revealed}
      >
        {children}
      </div>

      {/* reveal scrim */}
      <AnimatePresence>
        {!revealed && (
          <motion.button
            type="button"
            onClick={reveal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/40 backdrop-blur-sm"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-surface/80 text-gold shadow-glow-gold">
              <Lock weight="light" className="h-5 w-5" />
            </span>
            <div className="text-center">
              <p className="font-serif text-lg text-foreground">
                {label ?? "Sensitive content"}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-text-secondary">
                <Eye weight="light" className="h-3.5 w-3.5" />
                Tap to reveal · {CONTENT_LEVEL_LABEL[level]}
              </p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* re-hide affordance once revealed (for one-time reveals) */}
      {revealed && oneTime && (
        <button
          type="button"
          onClick={hideAgain}
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-[11px] text-text-secondary backdrop-blur-md transition-colors hover:text-foreground"
        >
          <EyeSlash weight="light" className="h-3.5 w-3.5" />
          Hide
        </button>
      )}
    </div>
  );
}
