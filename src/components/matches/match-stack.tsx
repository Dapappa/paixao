"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { MatchCard } from "./match-card";
import type { MatchCandidate, MatchActionResult } from "@/lib/hooks/use-matches";

/* ─────────────────────────────────────────────
   MatchStack
   ───────────────────────────────────────────── */

interface MatchStackProps {
  candidates: MatchCandidate[];
  onAction: (
    targetId: string,
    action: "like" | "pass" | "super_like"
  ) => Promise<MatchActionResult | null>;
  onNeedMore?: () => void;
  onViewProfile?: (candidateId: string) => void;
  className?: string;
}

export function MatchStack({
  candidates,
  onAction,
  onNeedMore,
  onViewProfile,
  className,
}: MatchStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | "up" | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<MatchCandidate | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const visibleCards = candidates.slice(currentIndex, currentIndex + 3);

  const handleAction = useCallback(
    async (action: "like" | "pass" | "super_like") => {
      if (isAnimating || !visibleCards[0]) return;

      const candidate = visibleCards[0];
      setIsAnimating(true);

      // Set exit direction for animation
      setExitDirection(
        action === "pass" ? "left" : action === "super_like" ? "up" : "right"
      );

      // Perform action
      const result = await onAction(candidate.id, action);

      // Wait for exit animation
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check if matched
      if (result?.matched) {
        setMatchedProfile(candidate);
        setShowMatch(true);
      }

      setExitDirection(null);
      setCurrentIndex((prev) => {
        const next = prev + 1;
        // Request more when 2 cards remain
        if (candidates.length - next <= 2 && onNeedMore) {
          onNeedMore();
        }
        return next;
      });
      setIsAnimating(false);
    },
    [isAnimating, visibleCards, onAction, candidates.length, onNeedMore]
  );

  const handleDragEnd = useCallback(
    (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      const swipeThreshold = 100;
      const velocityThreshold = 500;

      const isSwipedRight =
        offset.x > swipeThreshold || velocity.x > velocityThreshold;
      const isSwipedLeft =
        offset.x < -swipeThreshold || velocity.x < -velocityThreshold;
      const isSwipedUp =
        offset.y < -swipeThreshold || velocity.y < -velocityThreshold;

      if (isSwipedUp) {
        handleAction("super_like");
      } else if (isSwipedRight) {
        handleAction("like");
      } else if (isSwipedLeft) {
        handleAction("pass");
      }
    },
    [handleAction]
  );

  const exitVariants = {
    left: { x: -400, rotate: -20, opacity: 0 },
    right: { x: 400, rotate: 20, opacity: 0 },
    up: { y: -400, opacity: 0 },
  };

  if (visibleCards.length === 0) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center rounded-2xl border border-border bg-surface min-h-[500px]",
          className
        )}
      >
        <div className="text-center px-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent-muted)]">
            <Heart className="h-8 w-8 text-[var(--color-accent)]" />
          </div>
          <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
            No more profiles
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            You have seen all available profiles. Check back later or adjust
            your preferences to discover more people.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "relative w-full max-w-md mx-auto",
          "aspect-[3/4] min-h-[500px]",
          className
        )}
      >
        <AnimatePresence>
          {visibleCards.map((candidate, idx) => {
            const isTop = idx === 0;

            if (isTop && exitDirection) {
              return (
                <motion.div
                  key={candidate.id}
                  className="absolute inset-0"
                  initial={{ x: 0, y: 0, rotate: 0 }}
                  animate={exitVariants[exitDirection]}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <MatchCard
                    candidate={candidate}
                    isTop
                    stackIndex={0}
                  />
                </motion.div>
              );
            }

            return (
              <motion.div
                key={candidate.id}
                className="absolute inset-0"
                drag={isTop && !isAnimating ? true : false}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.8}
                onDragEnd={isTop ? handleDragEnd : undefined}
                onClick={
                  isTop && onViewProfile
                    ? () => onViewProfile(candidate.id)
                    : undefined
                }
                whileDrag={{ cursor: "grabbing" }}
                style={{
                  zIndex: 10 - idx,
                }}
              >
                <MatchCard
                  candidate={candidate}
                  isTop={isTop}
                  stackIndex={idx}
                  onAction={isTop ? handleAction : undefined}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Swipe hint indicators */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Left = pass */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity" />
          {/* Right = like */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity" />
        </div>
      </div>

      {/* Match celebration overlay */}
      <AnimatePresence>
        {showMatch && matchedProfile && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMatch(false)}
          >
            <motion.div
              className="relative flex flex-col items-center px-8 py-12 max-w-sm w-full"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative particles */}
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-2 w-2 rounded-full"
                  style={{
                    background:
                      i % 3 === 0
                        ? "#c2185b"
                        : i % 3 === 1
                          ? "#d4a574"
                          : "#e91e63",
                  }}
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                    scale: 0,
                  }}
                  animate={{
                    x: Math.cos((i * 30 * Math.PI) / 180) * (120 + i * 15),
                    y: Math.sin((i * 30 * Math.PI) / 180) * (120 + i * 15),
                    opacity: [1, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.05,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                />
              ))}

              {/* Match icon */}
              <motion.div
                className="mb-6"
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] shadow-[0_0_40px_rgba(194,24,91,0.5)]">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                className="font-serif text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-gold)] to-[var(--color-accent)]"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                It&apos;s a Match!
              </motion.h2>

              <motion.p
                className="text-muted-foreground mb-8 text-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                You and{" "}
                <span className="text-foreground font-semibold">
                  {matchedProfile.display_name || "someone special"}
                </span>{" "}
                liked each other
              </motion.p>

              {/* Avatar */}
              <motion.div
                className="mb-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 12,
                  delay: 0.4,
                }}
              >
                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-[var(--color-accent)] shadow-[0_0_30px_rgba(194,24,91,0.4)]">
                  {matchedProfile.primary_photo?.url ||
                  matchedProfile.avatar_url ? (
                    <img
                      src={
                        matchedProfile.primary_photo?.url ||
                        matchedProfile.avatar_url ||
                        ""
                      }
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-[var(--color-accent-muted)] flex items-center justify-center">
                      <span className="text-2xl font-serif text-[var(--color-accent)]">
                        {(matchedProfile.display_name || "?")[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                className="flex gap-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  onClick={() => setShowMatch(false)}
                  className="px-6 py-2.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors text-sm"
                >
                  Keep Swiping
                </button>
                <button
                  onClick={() => {
                    setShowMatch(false);
                    // Could navigate to messages here
                  }}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white font-medium text-sm hover:shadow-[0_0_20px_rgba(194,24,91,0.4)] transition-shadow"
                >
                  Send Message
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
