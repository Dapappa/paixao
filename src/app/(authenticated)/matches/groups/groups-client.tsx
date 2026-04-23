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
import { ArrowLeft, Plus, Users } from "lucide-react";
import Link from "next/link";

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/matches"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:border-foreground/30 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Groups
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Match as a couple, triad, or polycule
            </p>
          </div>
        </div>

        <Button
          onClick={() => router.push("/matches/groups/create")}
          className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-[0_0_20px_rgba(194,24,91,0.2)]"
        >
          <Plus className="mr-1 h-4 w-4" />
          Create Group
        </Button>
      </div>

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
          icon={Users}
          title="No groups yet"
          description="Create a group to match as a couple, triad, or polycule with other members."
          action={{
            label: "Create Group",
            onClick: () => router.push("/matches/groups/create"),
          }}
        />
      )}
    </div>
  );
}
