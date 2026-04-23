"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRealtimeSubscription } from "@/lib/hooks/use-realtime";

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */

export interface Notification {
  id: string;
  profile_id: string;
  type: string;
  title: string;
  body: string | null;
  action_url: string | null;
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

/* ─────────────────────────────────────────────
   Hook
   ───────────────────────────────────────────── */

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const fetchedRef = useRef(false);

  /* ── Fetch notifications ── */
  const fetchNotifications = useCallback(
    async (nextCursor?: string | null) => {
      if (!user) return;

      try {
        const params = new URLSearchParams({ limit: "20" });
        if (nextCursor) params.set("cursor", nextCursor);

        const res = await fetch(`/api/notifications?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch notifications");

        const data = await res.json();

        if (nextCursor) {
          setNotifications((prev) => [...prev, ...data.notifications]);
        } else {
          setNotifications(data.notifications);
        }

        setUnreadCount(data.unread_count);
        setCursor(data.next_cursor);
        setHasMore(!!data.next_cursor);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  /* ── Initial load ── */
  useEffect(() => {
    if (!user || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchNotifications();
  }, [user, fetchNotifications]);

  /* ── Realtime subscription ── */
  const handleRealtime = useCallback(
    (payload: { new: Notification }) => {
      const newNotification = payload.new;
      setNotifications((prev) => [newNotification, ...prev]);
      if (!newNotification.is_read) {
        setUnreadCount((prev) => prev + 1);
      }
    },
    [],
  );

  useRealtimeSubscription(
    `notifications:${user?.id ?? "anon"}`,
    user
      ? {
          table: "notifications",
          event: "INSERT",
          filter: `profile_id=eq.${user.id}`,
          callback: handleRealtime,
        }
      : null,
  );

  /* ── Actions ── */
  const markAsRead = useCallback(
    async (id: string) => {
      if (!user) return;

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        const res = await fetch(`/api/notifications/${id}/read`, {
          method: "PUT",
        });
        if (!res.ok) throw new Error("Failed to mark as read");
      } catch {
        // Revert on failure
        fetchNotifications();
      }
    },
    [user, fetchNotifications],
  );

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        is_read: true,
        read_at: n.read_at ?? new Date().toISOString(),
      })),
    );
    setUnreadCount(0);

    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to mark all as read");
    } catch {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  const refetch = useCallback(async () => {
    setLoading(true);
    fetchedRef.current = false;
    await fetchNotifications();
  }, [fetchNotifications]);

  const loadMore = useCallback(async () => {
    if (!hasMore || !cursor) return;
    await fetchNotifications(cursor);
  }, [hasMore, cursor, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch,
    loadMore,
    hasMore,
  };
}
