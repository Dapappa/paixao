"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ConnectionList } from "@/components/matches/connection-list";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { useConnections } from "@/lib/hooks/use-matches";
import { motion } from "framer-motion";
import { Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";

/* ─────────────────────────────────────────────
   ConnectionsClient
   ───────────────────────────────────────────── */

export function ConnectionsClient() {
  const router = useRouter();
  const { connections, loading, error, totalCount } = useConnections();

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
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Connections
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount > 0
              ? `${totalCount} mutual ${totalCount === 1 ? "match" : "matches"}`
              : "Your mutual matches will appear here"}
          </p>
        </div>
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
          icon={Heart}
          title="No connections yet"
          description="When you and another person like each other, you will both appear here. Start discovering people to find your first match!"
          action={{
            label: "Discover People",
            onClick: () => router.push("/matches"),
          }}
        />
      )}
    </div>
  );
}
