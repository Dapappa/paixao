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
import { Sparkle, ArrowLeft } from "@phosphor-icons/react/ssr";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { MatchesAtmosphere } from "../matches-atmosphere";

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
    <div className="relative z-10 space-y-6">
      <MatchesAtmosphere />

      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link
          href="/matches"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/50 backdrop-blur-sm hover:border-accent/30 text-text-secondary hover:text-foreground transition-all"
        >
          <ArrowLeft weight="bold" className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold/80">
            Hand-picked for you
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground">
              Top picks
            </h1>
            <Sparkle weight="fill" className="h-5 w-5 animate-breath text-gold" />
          </div>
          <p className="text-sm text-text-secondary mt-1.5">
            The few we think you&rsquo;d get along with.
          </p>
        </div>
      </div>

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gold/20 bg-gold-muted px-4 py-3 backdrop-blur-sm"
      >
        <p className="text-sm text-gold">
          <Sparkle weight="fill" className="inline h-3.5 w-3.5 mr-1.5" />
          Each one shares <strong>three or more</strong> of your wants &mdash;
          the real ones.
        </p>
      </motion.div>

      {/* Loading */}
      {loading && (
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
          icon={Sparkle as unknown as LucideIcon}
          title="Quiet here — for now"
          description="No one yet shares enough of what you're after. Widen your circle a touch and we'll keep looking."
          action={{
            label: "Back to discover",
            onClick: () => router.push("/matches"),
          }}
        />
      )}
    </div>
  );
}
