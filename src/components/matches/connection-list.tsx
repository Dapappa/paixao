"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { MatchConnection } from "@/lib/hooks/use-matches";

/* ─────────────────────────────────────────────
   ConnectionList
   ───────────────────────────────────────────── */

interface ConnectionListProps {
  connections: MatchConnection[];
  className?: string;
}

export function ConnectionList({ connections, className }: ConnectionListProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
    >
      {connections.map((conn, idx) => {
        const profile = conn.profile;
        if (!profile) return null;

        const isNew =
          conn.matched_at &&
          Date.now() - new Date(conn.matched_at).getTime() < 24 * 60 * 60 * 1000;

        const matchedAgo = conn.matched_at
          ? formatDistanceToNow(new Date(conn.matched_at), { addSuffix: true })
          : null;

        return (
          <motion.div
            key={conn.match_id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link
              href={`/matches/${profile.id}`}
              className="block"
            >
              <div
                className={cn(
                  "group relative rounded-xl border bg-surface p-4",
                  "transition-all duration-300",
                  "hover:shadow-[0_0_30px_rgba(194,24,91,0.12)]",
                  "hover:border-[var(--color-accent)]/30",
                  isNew
                    ? "border-[var(--color-gold)]/30"
                    : "border-border"
                )}
              >
                {/* New match indicator */}
                {isNew && (
                  <div className="absolute -top-1.5 -right-1.5">
                    <Badge className="bg-[var(--color-gold)] text-black border-0 text-[10px] px-1.5 py-0.5">
                      <Sparkles className="mr-0.5 h-2.5 w-2.5" />
                      New
                    </Badge>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <Avatar
                    className={cn(
                      "h-14 w-14 ring-2 transition-all",
                      isNew
                        ? "ring-[var(--color-gold)]/40"
                        : "ring-border group-hover:ring-[var(--color-accent)]/30"
                    )}
                  >
                    <AvatarImage
                      src={profile.avatar_url || undefined}
                      alt={profile.display_name || ""}
                    />
                    <AvatarFallback className="bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-serif text-lg">
                      {(profile.display_name || "?")[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-[var(--color-accent)] transition-colors">
                      {profile.display_name || "Anonymous"}
                    </h3>
                    {profile.tagline && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {profile.tagline}
                      </p>
                    )}
                    {matchedAgo && (
                      <p className="text-[11px] text-muted-foreground/60 mt-1">
                        Matched {matchedAgo}
                      </p>
                    )}
                  </div>

                  {/* Message button */}
                  {conn.conversation_id && (
                    <Link
                      href={`/messages/${conn.conversation_id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 transition-colors shrink-0"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
