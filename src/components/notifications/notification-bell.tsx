"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { NotificationItem } from "@/components/notifications/notification-item";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CaretRight } from "@phosphor-icons/react/ssr";
import { useState } from "react";

/* ─────────────────────────────────────────────
   NotificationBell — header component
   ───────────────────────────────────────────── */

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [open, setOpen] = useState(false);

  const recentNotifications = notifications.slice(0, 5);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          aria-label="Notifications"
        >
          <Bell weight="light" className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={cn(
                  "absolute flex items-center justify-center rounded-full bg-[var(--color-accent)] font-medium text-white",
                  unreadCount > 9
                    ? "-right-1 -top-1 h-5 min-w-5 px-1 text-[10px]"
                    : "right-1 top-1 h-4 w-4 text-[10px]",
                )}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-2rem)] max-w-[360px] border-[var(--color-border)] bg-[var(--color-surface)] p-0 shadow-2xl sm:w-[360px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="font-serif text-sm font-semibold tracking-wide text-foreground">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-xs text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent)]/80"
            >
              Mark all read
            </button>
          )}
        </div>

        <Separator className="bg-[var(--color-border)]" />

        {/* Notification List */}
        <ScrollArea className="max-h-[340px]">
          {recentNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-elevated)]">
                <Bell weight="duotone" className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                No notifications yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                You&apos;re all caught up
              </p>
            </div>
          ) : (
            <div className="py-1">
              {recentNotifications.map((notification) => (
                <div key={notification.id} onClick={() => setOpen(false)}>
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    compact
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator className="bg-[var(--color-border)]" />

        {/* View All Link */}
        <Link
          href="/notifications"
          onClick={() => setOpen(false)}
          className="flex items-center justify-center gap-1 py-2.5 text-xs font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent)]/80"
        >
          View all notifications
          <CaretRight weight="bold" className="h-3 w-3" />
        </Link>
      </PopoverContent>
    </Popover>
  );
}
