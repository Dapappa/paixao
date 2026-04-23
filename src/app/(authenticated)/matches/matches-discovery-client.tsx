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
import { Heart, Sparkles, Users, Star } from "lucide-react";
import Link from "next/link";

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
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Discover
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Find your next connection
          </p>
        </div>

        {/* Quick links */}
        <div className="flex items-center gap-2">
          <Link
            href="/matches/connections"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <Users className="h-3.5 w-3.5" />
            Connections
          </Link>
          <Link
            href="/matches/suggestions"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-gold)]/30 text-sm text-[var(--color-gold)] hover:border-[var(--color-gold)]/60 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Top Picks
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-[var(--color-accent)]" />
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{maxLikes}</span>{" "}
            likes / day
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-[var(--color-gold)]" />
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {subscriptionTier === "curious" ? 1 : subscriptionTier === "explorer" ? 3 : 5}
            </span>{" "}
            super likes
          </span>
        </div>
        <div className="ml-auto">
          <Badge
            variant="outline"
            className="border-[var(--color-gold)]/30 text-[var(--color-gold)] text-[10px] capitalize"
          >
            {subscriptionTier}
          </Badge>
        </div>
      </motion.div>

      {/* Filters */}
      <MatchFilters filters={filters} onFiltersChange={setFilters} />

      {/* Loading */}
      {loading && candidates.length === 0 && (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
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
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-accent-muted)]">
            <Heart className="h-8 w-8 text-[var(--color-accent)]" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No profiles yet
          </h3>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            There are no profiles matching your preferences right now. Try
            adjusting your filters or check back later.
          </p>
        </div>
      )}
    </div>
  );
}
