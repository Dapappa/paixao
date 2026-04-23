"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  X,
  Heart,
  Star,
  MapPin,
  Sparkles,
} from "lucide-react";
import type { MatchCandidate } from "@/lib/hooks/use-matches";

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

function calculateAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/* ─────────────────────────────────────────────
   MatchCard
   ───────────────────────────────────────────── */

interface MatchCardProps {
  candidate: MatchCandidate;
  onAction?: (action: "like" | "pass" | "super_like") => void;
  isTop?: boolean;
  stackIndex?: number;
  className?: string;
}

export function MatchCard({
  candidate,
  onAction,
  isTop = false,
  stackIndex = 0,
  className,
}: MatchCardProps) {
  const age = calculateAge(candidate.date_of_birth);
  const photoUrl =
    candidate.primary_photo?.url || candidate.avatar_url || null;
  const sharedInterests = candidate.interests.filter((i) => i.is_shared);
  const topInterests = candidate.interests.slice(0, 5);

  // Stack offset styling
  const stackScale = 1 - stackIndex * 0.04;
  const stackY = stackIndex * 8;

  return (
    <motion.div
      className={cn(
        "absolute inset-0 rounded-2xl overflow-hidden",
        "border border-border bg-surface",
        "shadow-xl",
        isTop && "cursor-grab active:cursor-grabbing",
        className
      )}
      style={{
        zIndex: 10 - stackIndex,
        scale: stackScale,
        y: stackY,
      }}
      initial={isTop ? { scale: 0.95, opacity: 0 } : false}
      animate={
        isTop
          ? { scale: 1, opacity: 1 }
          : { scale: stackScale, y: stackY, opacity: 1 }
      }
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Photo */}
      <div className="relative h-full w-full">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={candidate.display_name || "Profile"}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[var(--color-accent)]/20 via-surface to-surface-elevated flex items-center justify-center">
            <span className="text-6xl font-serif text-[var(--color-accent)]/40">
              {(candidate.display_name || "?")[0]?.toUpperCase()}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Compatibility badge */}
        {candidate.compatibility_score > 0 && (
          <div className="absolute top-4 right-4">
            <Badge
              className={cn(
                "border-0 backdrop-blur-md text-sm font-bold px-3 py-1",
                candidate.compatibility_score >= 70
                  ? "bg-[var(--color-gold)]/90 text-black"
                  : candidate.compatibility_score >= 40
                    ? "bg-[var(--color-accent)]/80 text-white"
                    : "bg-white/20 text-white"
              )}
            >
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              {candidate.compatibility_score}%
            </Badge>
          </div>
        )}

        {/* Info overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 pb-24">
          {/* Name and age */}
          <div className="flex items-baseline gap-2 mb-1.5">
            <h2 className="font-serif text-2xl font-bold text-white truncate">
              {candidate.display_name || "Anonymous"}
            </h2>
            {age && (
              <span className="text-lg text-white/70 font-light">{age}</span>
            )}
          </div>

          {/* Tagline */}
          {candidate.tagline && (
            <p className="text-sm text-white/70 mb-3 line-clamp-2">
              {candidate.tagline}
            </p>
          )}

          {/* Location */}
          {candidate.location && (
            <div className="flex items-center gap-1.5 text-sm text-white/60 mb-3">
              <MapPin className="h-3.5 w-3.5" />
              <span>{candidate.location}</span>
            </div>
          )}

          {/* Shared interests */}
          {topInterests.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {topInterests.map((interest) => (
                <Badge
                  key={interest.id}
                  variant="outline"
                  className={cn(
                    "text-xs backdrop-blur-sm",
                    interest.is_shared
                      ? "border-[var(--color-gold)]/60 text-[var(--color-gold)] bg-[var(--color-gold)]/10"
                      : "border-white/20 text-white/70 bg-white/5"
                  )}
                >
                  {interest.emoji && (
                    <span className="mr-0.5">{interest.emoji}</span>
                  )}
                  {interest.name}
                </Badge>
              ))}
              {sharedInterests.length > topInterests.filter((i) => i.is_shared).length && (
                <Badge
                  variant="outline"
                  className="text-xs border-[var(--color-gold)]/40 text-[var(--color-gold)]/70 backdrop-blur-sm"
                >
                  +{sharedInterests.length - topInterests.filter((i) => i.is_shared).length} shared
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        {isTop && onAction && (
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 px-6">
            <Button
              size="icon"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onAction("pass");
              }}
              className="h-14 w-14 rounded-full border-2 border-red-400/40 bg-black/40 backdrop-blur-sm text-red-400 hover:bg-red-500/20 hover:border-red-400 hover:text-red-300 transition-all shadow-lg"
            >
              <X className="h-6 w-6" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onAction("super_like");
              }}
              className="h-12 w-12 rounded-full border-2 border-[var(--color-gold)]/40 bg-black/40 backdrop-blur-sm text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20 hover:border-[var(--color-gold)] transition-all shadow-lg"
            >
              <Star className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onAction("like");
              }}
              className="h-14 w-14 rounded-full border-2 border-[var(--color-accent)]/40 bg-black/40 backdrop-blur-sm text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 hover:border-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-all shadow-lg"
            >
              <Heart className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
