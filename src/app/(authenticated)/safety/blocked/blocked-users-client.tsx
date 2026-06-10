"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Prohibit,
  CaretLeft,
  CircleNotch,
  UserMinus,
  Shield,
} from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { useSafety, type BlockedUser } from "@/lib/hooks/use-safety";
import { formatDistanceToNow } from "date-fns";

/* ─────────────────────────────────────────────
   BlockedUsersClient
   ───────────────────────────────────────────── */

export function BlockedUsersClient() {
  const { getBlockedUsers, unblockUser, loading } = useSafety();
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const users = await getBlockedUsers();
      setBlocked(users);
      setInitialLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnblock = async (userId: string) => {
    setUnblockingId(userId);
    const ok = await unblockUser(userId);
    if (ok) {
      setBlocked((prev) => prev.filter((b) => b.blocked_id !== userId));
    }
    setUnblockingId(null);
  };

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
      {/* ── Ambient aura backdrop (Velvet Aura) ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.16] mix-blend-screen"
          style={{ backgroundImage: "url(/generated/bg-bar.webp)" }}
        />
        <div className="aura-field absolute inset-0 animate-aura-drift opacity-60" />
        <div className="absolute left-1/2 top-[-10%] h-[420px] w-[560px] -translate-x-1/2 rounded-full bg-gold/[0.05] blur-[120px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.05, 0.7, 0.1, 1] as const }}
        className="relative z-10 mx-auto max-w-2xl"
      >
        {/* Back link */}
        <Link href="/safety">
          <Button variant="ghost" size="sm" className="mb-4 text-text-secondary">
            <CaretLeft weight="bold" className="mr-1 h-4 w-4" />
            Safety Center
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-7">
          <div className="mb-3 flex items-center gap-2">
            <Prohibit weight="light" className="h-6 w-6 text-gold" />
            <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              The doors you&apos;ve closed
            </h1>
          </div>
          <p className="leading-relaxed text-text-secondary">
            Anyone here can&apos;t see you, reach you, or cross your path again.
            Open a door if you want to — though it won&apos;t bring back old matches
            or chats. That part stays in the past.
          </p>
        </div>

        {/* Content */}
        {initialLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <CircleNotch weight="bold" className="h-6 w-6 animate-spin text-accent" />
            <p className="font-serif text-sm italic text-gold/70">
              Setting the mood&hellip;
            </p>
          </div>
        ) : blocked.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="No doors closed"
            description="You haven't shut anyone out — and that's a good sign. If someone ever makes you uneasy, you can block them from their profile or your conversation, no questions asked."
          />
        ) : (
          <div className="space-y-2">
            {blocked.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center justify-between rounded-2xl border border-border/50 bg-surface/50 p-4 backdrop-blur-sm transition-colors hover:border-accent/30"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.blocked?.avatar_url || undefined}
                      alt={user.blocked?.display_name || "User"}
                    />
                    <AvatarFallback className="bg-surface-elevated text-xs text-text-secondary">
                      <UserMinus weight="light" className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {user.blocked?.display_name || "Someone, no longer here"}
                    </p>
                    <p className="text-xs text-text-secondary">
                      Closed{" "}
                      {formatDistanceToNow(new Date(user.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnblock(user.blocked_id)}
                  disabled={unblockingId === user.blocked_id}
                  className="border-border text-text-secondary hover:border-accent/30 hover:text-foreground"
                >
                  {unblockingId === user.blocked_id ? (
                    <CircleNotch weight="bold" className="h-4 w-4 animate-spin" />
                  ) : (
                    "Open the door"
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Atmosphere overlays ── */}
      <div className="vignette" aria-hidden />
      <div className="film-grain" aria-hidden />
    </div>
  );
}
