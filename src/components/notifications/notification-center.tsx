"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationItem } from "@/components/notifications/notification-item";
import { useNotifications, type Notification } from "@/lib/hooks/use-notifications";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Heart,
  MessageCircle,
  Calendar,
  Shield,
} from "lucide-react";
import {
  isToday,
  isYesterday,
  isThisWeek,
  format,
} from "date-fns";

/* ─────────────────────────────────────────────
   Filter tabs
   ───────────────────────────────────────────── */

const filterTabs = [
  { value: "all", label: "All", icon: Bell },
  { value: "matches", label: "Matches", icon: Heart },
  { value: "messages", label: "Messages", icon: MessageCircle },
  { value: "events", label: "Events", icon: Calendar },
  { value: "system", label: "System", icon: Shield },
];

const typeToFilter: Record<string, string> = {
  new_match: "matches",
  match_suggestion: "matches",
  new_message: "messages",
  event_reminder: "events",
  event_update: "events",
  registration_confirmed: "events",
  report_update: "system",
  consent_request: "system",
  system_announcement: "system",
  verification_approved: "system",
  verification_rejected: "system",
  host_application_update: "system",
  subscription_expiring: "system",
};

/* ─────────────────────────────────────────────
   Group notifications by date
   ───────────────────────────────────────────── */

interface NotificationGroup {
  label: string;
  notifications: Notification[];
}

function groupByDate(notifications: Notification[]): NotificationGroup[] {
  const groups: Record<string, Notification[]> = {};

  for (const n of notifications) {
    const date = new Date(n.created_at);
    let label: string;

    if (isToday(date)) {
      label = "Today";
    } else if (isYesterday(date)) {
      label = "Yesterday";
    } else if (isThisWeek(date)) {
      label = "This Week";
    } else {
      label = "Older";
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }

  const order = ["Today", "Yesterday", "This Week", "Older"];
  return order
    .filter((label) => groups[label]?.length)
    .map((label) => ({
      label,
      notifications: groups[label],
    }));
}

/* ─────────────────────────────────────────────
   NotificationCenter — full page list
   ───────────────────────────────────────────── */

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    loadMore,
    hasMore,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState("all");
  const observerRef = useRef<HTMLDivElement | null>(null);

  /* ── Filter notifications client-side ── */
  const filtered =
    activeFilter === "all"
      ? notifications
      : notifications.filter(
          (n) => typeToFilter[n.type] === activeFilter,
        );

  const groups = groupByDate(filtered);

  /* ── Infinite scroll ── */
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (loading) {
    return <NotificationCenterSkeleton />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-wide text-foreground">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up"}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead()}
            className="gap-2 border-[var(--color-border)] text-xs"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={activeFilter}
        onValueChange={setActiveFilter}
        className="mt-6"
      >
        <TabsList className="w-full justify-start gap-1 overflow-x-auto bg-transparent p-0">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "gap-1.5 rounded-full border border-transparent px-4 py-2 text-xs font-medium transition-all",
                  "data-[state=active]:border-[var(--color-accent)] data-[state=active]:bg-[var(--color-accent)]/10 data-[state=active]:text-[var(--color-accent)]",
                  "data-[state=inactive]:bg-[var(--color-surface-elevated)] data-[state=inactive]:text-muted-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Notification Groups */}
      <div className="mt-6 space-y-6">
        {groups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-16 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-elevated)]">
              <Bell className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="mt-4 font-serif text-lg text-foreground">
              No notifications
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeFilter !== "all"
                ? "No notifications in this category"
                : "When something happens, you'll see it here"}
            </p>
          </motion.div>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                {group.label}
              </h3>
              <div className="space-y-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
                {group.notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={observerRef} className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Loading Skeleton
   ───────────────────────────────────────────── */

function NotificationCenterSkeleton() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 bg-[var(--color-surface-elevated)]" />
          <Skeleton className="mt-2 h-4 w-32 bg-[var(--color-surface-elevated)]" />
        </div>
        <Skeleton className="h-9 w-32 bg-[var(--color-surface-elevated)]" />
      </div>

      <div className="mt-6 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-9 w-24 rounded-full bg-[var(--color-surface-elevated)]"
          />
        ))}
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <Skeleton className="mb-2 h-4 w-16 bg-[var(--color-surface-elevated)]" />
          <div className="space-y-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 px-4 py-3">
                <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-[var(--color-surface-elevated)]" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-[var(--color-surface-elevated)]" />
                  <Skeleton className="h-3 w-1/2 bg-[var(--color-surface-elevated)]" />
                  <Skeleton className="h-3 w-20 bg-[var(--color-surface-elevated)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
