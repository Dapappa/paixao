"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { MatchStack } from "@/components/matches/match-stack";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import {
  useMatches,
  useMatchAction,
} from "@/lib/hooks/use-matches";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

/* ─────────────────────────────────────────────
   SuggestionsClient — high compatibility only
   ───────────────────────────────────────────── */

export function SuggestionsClient() {
  const router = useRouter();

  const { candidates, loading, error, fetchMore } = useMatches({
    min_shared_interests: 3,
  });

  const { performAction } = useMatchAction();

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
      <div className="flex items-center gap-4">
        <Link
          href="/matches"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:border-foreground/30 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Top Picks
            </h1>
            <Sparkles className="h-5 w-5 text-[var(--color-gold)]" />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Profiles with the highest compatibility
          </p>
        </div>
      </div>

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/5 px-4 py-3"
      >
        <p className="text-sm text-[var(--color-gold)]">
          <Sparkles className="inline h-3.5 w-3.5 mr-1.5" />
          These profiles share <strong>3 or more</strong> interests with you
        </p>
      </motion.div>

      {/* Loading */}
      {loading && (
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

      {/* Stack */}
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

      {/* Empty */}
      {!loading && !error && candidates.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="No top picks yet"
          description="We could not find profiles with enough shared interests right now. Try broadening your preferences."
          action={{
            label: "Back to Discover",
            onClick: () => router.push("/matches"),
          }}
        />
      )}
    </div>
  );
}
