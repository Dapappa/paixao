"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ConnectionList } from "@/components/matches/connection-list";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { useConnections } from "@/lib/hooks/use-matches";
import { motion } from "framer-motion";
import { Heart, ArrowLeft } from "@phosphor-icons/react/ssr";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { MatchesAtmosphere } from "../matches-atmosphere";

/* ─────────────────────────────────────────────
   ConnectionsClient
   ───────────────────────────────────────────── */

export function ConnectionsClient() {
  const router = useRouter();
  const { connections, loading, error, totalCount } = useConnections();

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
            Two-way wants
          </p>
          <h1 className="mt-1.5 font-serif text-4xl font-bold tracking-tight text-foreground">
            Yours
          </h1>
          <p className="text-sm text-text-secondary mt-1.5">
            {totalCount > 0
              ? `${totalCount} ${totalCount === 1 ? "person" : "people"} leaning back toward you.`
              : "When the wanting runs both ways, they land here."}
          </p>
        </div>
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

      {/* Connections grid */}
      {!loading && !error && connections.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ConnectionList connections={connections} />
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && !error && connections.length === 0 && (
        <EmptyState
          icon={Heart as unknown as LucideIcon}
          title="Quiet here — for now"
          description="When you and someone else both lean in, you'll find each other here. Go read the room and make the first move."
          action={{
            label: "Read the room",
            onClick: () => router.push("/matches"),
          }}
        />
      )}
    </div>
  );
}
