"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  GroupMatchCard,
  type MatchGroup,
} from "@/components/matches/group-match-card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, UsersThree } from "@phosphor-icons/react/ssr";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { MatchesAtmosphere } from "../matches-atmosphere";

/* ─────────────────────────────────────────────
   GroupsClient
   ───────────────────────────────────────────── */

export function GroupsClient() {
  const router = useRouter();
  const [groups, setGroups] = useState<MatchGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/matches/groups");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to fetch groups");
      }
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <div className="relative z-10 space-y-6">
      <MatchesAtmosphere />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/matches"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/50 backdrop-blur-sm hover:border-accent/30 text-text-secondary hover:text-foreground transition-all"
          >
            <ArrowLeft weight="bold" className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold/80">
              More than two
            </p>
            <h1 className="mt-1.5 font-serif text-4xl font-bold tracking-tight text-foreground">
              Together
            </h1>
            <p className="text-sm text-text-secondary mt-1.5">
              Arrive as a couple, a triad, a whole polycule.
            </p>
          </div>
        </div>

        <Button
          onClick={() => router.push("/matches/groups/create")}
          className="bg-accent text-white hover:bg-accent-hover shadow-glow-accent"
        >
          <Plus weight="bold" className="mr-1 h-4 w-4" />
          Start a group
        </Button>
      </div>

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

      {/* Groups grid */}
      {!loading && !error && groups.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {groups.map((group, idx) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <GroupMatchCard group={group} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && !error && groups.length === 0 && (
        <EmptyState
          icon={UsersThree as unknown as LucideIcon}
          title="No groups yet"
          description="Start one to meet other members as a couple, a triad, or a whole polycule — together, on your terms."
          action={{
            label: "Start a group",
            onClick: () => router.push("/matches/groups/create"),
          }}
        />
      )}
    </div>
  );
}
