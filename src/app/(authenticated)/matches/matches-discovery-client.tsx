"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MatchStack } from "@/components/matches/match-stack";
import { MatchFilters, type MatchFiltersState } from "@/components/matches/match-filters";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  useMatches,
  useMatchAction,
} from "@/lib/hooks/use-matches";
import { motion } from "framer-motion";
import { Heart, Sparkle, UsersThree, Star } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { MatchesAtmosphere } from "./matches-atmosphere";

/* ─────────────────────────────────────────────
   MatchesDiscoveryClient
   ───────────────────────────────────────────── */

interface MatchesDiscoveryClientProps {
  subscriptionTier: string;
}

// Likes per day by tier
const LIKES_BY_TIER: Record<string, number> = {
  curious: 10,
  explorer: 25,
  passionate: 50,
  devoted: 999,
  admin: 999,
};

export function MatchesDiscoveryClient({
  subscriptionTier,
}: MatchesDiscoveryClientProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<MatchFiltersState>({
    genders: [],
    min_age: 18,
    max_age: 99,
    experience_levels: [],
  });

  const {
    candidates,
    loading,
    error,
    fetchMore,
  } = useMatches({
    genders: filters.genders,
    min_age: filters.min_age,
    max_age: filters.max_age,
    experience_levels: filters.experience_levels,
  });

  const { performAction } = useMatchAction();

  const maxLikes = LIKES_BY_TIER[subscriptionTier] || 10;

  const handleAction = useCallback(
    async (targetId: string, action: "like" | "pass" | "super_like") => {
      return await performAction(targetId, action);
    },
    [performAction]
  );

  const handleViewProfile = useCallback(
    (candidateId: string) => {
      router.push(`/matches/${candidateId}`);
    },
    [router]
  );

  return (
    <div className="relative z-10 space-y-6">
      <MatchesAtmosphere />

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold/80">
            Read the room
          </p>
          <h1 className="mt-1.5 font-serif text-4xl font-bold tracking-tight text-foreground">
            Who&rsquo;s near
          </h1>
          <p className="text-sm text-text-secondary mt-1.5">
            Linger a little. The right one&rsquo;s worth slowing down for.
          </p>
        </div>

        {/* Quick links */}
        <div className="flex items-center gap-2">
          <Link
            href="/matches/connections"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border bg-surface/50 backdrop-blur-sm text-sm text-text-secondary hover:text-foreground hover:border-accent/30 hover:shadow-glow-accent transition-all"
          >
            <UsersThree weight="light" className="h-3.5 w-3.5" />
            Yours
          </Link>
          <Link
            href="/matches/suggestions"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gold/30 bg-surface/50 backdrop-blur-sm text-sm text-gold hover:border-gold/60 transition-all"
          >
            <Sparkle weight="fill" className="h-3.5 w-3.5" />
            Top picks
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-border/60 bg-surface/50 backdrop-blur-sm px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Heart weight="fill" className="h-4 w-4 text-accent" />
          <span className="text-sm text-text-secondary">
            <span className="font-semibold text-foreground">{maxLikes}</span>{" "}
            likes / day
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Star weight="fill" className="h-4 w-4 text-gold" />
          <span className="text-sm text-text-secondary">
            <span className="font-semibold text-foreground">
              {subscriptionTier === "curious" ? 1 : subscriptionTier === "explorer" ? 3 : 5}
            </span>{" "}
            super likes
          </span>
        </div>
        <div className="ml-auto">
          <Badge
            variant="outline"
            className="border-gold/30 text-gold text-[10px] capitalize"
          >
            {subscriptionTier}
          </Badge>
        </div>
      </motion.div>

      {/* Filters */}
      <MatchFilters filters={filters} onFiltersChange={setFilters} />

      {/* Loading */}
      {loading && candidates.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <LoadingSpinner size="lg" />
          <p className="text-sm italic text-text-secondary">Setting the mood&hellip;</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-center">
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
        </div>
      )}

      {/* Match Stack */}
      {!loading && !error && candidates.length > 0 && (
        <div className="flex justify-center px-4 pb-8">
          <MatchStack
            candidates={candidates}
            onAction={handleAction}
            onNeedMore={fetchMore}
            onViewProfile={handleViewProfile}
          />
        </div>
      )}

      {/* Empty state handled inside MatchStack */}
      {!loading && !error && candidates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="mb-4 flex h-16 w-16 animate-breath items-center justify-center rounded-2xl bg-accent-muted">
            <Heart weight="duotone" className="h-8 w-8 text-accent" />
          </div>
          <h3 className="mb-2 font-serif text-xl font-semibold text-foreground">
            Quiet here &mdash; for now
          </h3>
          <p className="mb-6 max-w-sm text-sm leading-relaxed text-text-secondary">
            No one new tonight who fits what you&rsquo;ve set. Widen your circle
            a touch, or come back when the room fills.
          </p>
          <Link
            href="/matches/preferences"
            className="rounded-full border border-accent/30 bg-surface/50 px-4 py-2 text-sm text-foreground backdrop-blur-sm transition-all hover:border-accent/60 hover:shadow-glow-accent"
          >
            Widen your circle
          </Link>
        </div>
      )}
    </div>
  );
}
