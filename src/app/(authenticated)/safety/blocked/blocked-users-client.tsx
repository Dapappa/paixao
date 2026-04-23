"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Ban,
  ChevronLeft,
  Loader2,
  UserX,
  Shield,
} from "lucide-react";
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8"
    >
      {/* Back link */}
      <Link href="/safety">
        <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Safety Center
        </Button>
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Ban className="h-6 w-6 text-orange-400" />
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Blocked Users
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Users you have blocked cannot see your profile, send you messages, or
          interact with you. Unblocking will not restore previous matches or
          conversations.
        </p>
      </div>

      {/* Content */}
      {initialLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#c2185b]" />
        </div>
      ) : blocked.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No blocked users"
          description="You have not blocked anyone. If someone makes you feel unsafe, you can block them from their profile or conversation."
        />
      ) : (
        <div className="space-y-2">
          {blocked.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/30 p-4"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user.blocked?.avatar_url || undefined}
                    alt={user.blocked?.display_name || "User"}
                  />
                  <AvatarFallback className="bg-zinc-800 text-xs text-muted-foreground">
                    <UserX className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {user.blocked?.display_name || "Unknown User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Blocked{" "}
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
                className="border-zinc-700 text-muted-foreground hover:text-foreground"
              >
                {unblockingId === user.blocked_id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Unblock"
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
