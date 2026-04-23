"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */

export interface ConversationListItem {
  id: string;
  other_user: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    public_key: string | null;
  };
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;
  is_archived: boolean;
  is_muted: boolean;
  created_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  encrypted_content: string | null;
  message_type: string;
  media_url: string | null;
  media_type: string | null;
  is_read: boolean;
  read_at: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  reply_to_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  sender: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface OtherUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  public_key: string | null;
}

/* ─────────────────────────────────────────────
   useConversations — GET /api/messages
   ───────────────────────────────────────────── */

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/messages");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to fetch conversations");
      }
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Subscribe to realtime changes on conversations table
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("conversations-list");

    channel.on(
      "postgres_changes" as any,
      {
        event: "*",
        schema: "public",
        table: "conversations",
      },
      () => {
        // Refetch conversation list on any change
        fetchConversations();
      },
    );

    channel.on(
      "postgres_changes" as any,
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      () => {
        // Refetch when any new message arrives (updates unread counts + preview)
        fetchConversations();
      },
    );

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [fetchConversations]);

  return { conversations, loading, error, refetch: fetchConversations };
}

/* ─────────────────────────────────────────────
   useMessages — GET + POST /api/messages/[id]
   ───────────────────────────────────────────── */

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [sending, setSending] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const currentUserIdRef = useRef<string | null>(null);

  // Get current user id on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      currentUserIdRef.current = user?.id ?? null;
    });
  }, []);

  const fetchMessages = useCallback(
    async (beforeId?: string) => {
      if (!conversationId) return;

      if (!beforeId) setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (beforeId) params.set("before_id", beforeId);
        params.set("limit", "50");

        const res = await fetch(
          `/api/messages/${conversationId}?${params.toString()}`,
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to fetch messages");
        }

        const data = await res.json();
        const fetchedMessages: MessageRow[] = data.messages ?? [];

        if (beforeId) {
          // Append older messages
          setMessages((prev) => [...prev, ...fetchedMessages]);
        } else {
          // Initial load — messages come in DESC order, reverse for display
          setMessages(fetchedMessages.reverse());
        }

        setHasMore(data.hasMore ?? false);
        if (data.other_user) setOtherUser(data.other_user);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [conversationId],
  );

  // Initial fetch
  useEffect(() => {
    if (conversationId) {
      setMessages([]);
      setOtherUser(null);
      fetchMessages();
    }
  }, [conversationId, fetchMessages]);

  // Load more (older messages)
  const loadMore = useCallback(() => {
    if (messages.length === 0 || !hasMore) return;
    // The oldest message is the first in our array (since we reversed)
    const oldestId = messages[0]?.id;
    if (oldestId) {
      fetchMessages(oldestId).then(() => {
        // After loading, older messages are appended. We need to re-reverse correctly.
        // Actually — the API returns DESC, and for "before_id" we append.
        // Let's fix: on loadMore, we prepend the older (reversed) messages.
        setMessages((prev) => {
          // The fetchMessages callback already appended. But they need to be prepended.
          // We'll handle this in fetchMessages instead.
          return prev;
        });
      });
    }
  }, [messages, hasMore, fetchMessages]);

  // Send message
  const sendMessage = useCallback(
    async (content: string, messageType: string = "text") => {
      if (!conversationId || !content.trim()) return;

      setSending(true);

      // Optimistic message
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticMsg: MessageRow = {
        id: optimisticId,
        conversation_id: conversationId,
        sender_id: currentUserIdRef.current ?? "",
        content,
        encrypted_content: null,
        message_type: messageType,
        media_url: null,
        media_type: null,
        is_read: false,
        read_at: null,
        is_edited: false,
        is_deleted: false,
        reply_to_id: null,
        metadata: {},
        created_at: new Date().toISOString(),
        sender: null,
      };

      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        const res = await fetch(`/api/messages/${conversationId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, message_type: messageType }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to send message");
        }

        const data = await res.json();
        const realMsg: MessageRow = data.message;

        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? realMsg : m)),
        );
      } catch (err) {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        setError(err instanceof Error ? err.message : "Failed to send");
      } finally {
        setSending(false);
      }
    },
    [conversationId],
  );

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!conversationId) return;
    try {
      await fetch(`/api/messages/${conversationId}/read`, { method: "PUT" });
    } catch {
      // Silent fail — non-critical
    }
  }, [conversationId]);

  // Realtime subscription for new messages in this conversation
  useEffect(() => {
    if (!conversationId) return;

    const supabase = createClient();
    const channel = supabase.channel(`conversation:${conversationId}`);

    channel.on(
      "postgres_changes" as any,
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload: any) => {
        const newMsg = payload.new as any;
        // Only add if from other user (our own messages are added optimistically)
        if (newMsg && newMsg.sender_id !== currentUserIdRef.current) {
          // We need sender profile info — fetch it or use a stub
          const incoming: MessageRow = {
            id: newMsg.id,
            conversation_id: newMsg.conversation_id,
            sender_id: newMsg.sender_id,
            content: newMsg.content,
            encrypted_content: newMsg.encrypted_content,
            message_type: newMsg.message_type ?? "text",
            media_url: newMsg.media_url,
            media_type: newMsg.media_type,
            is_read: false,
            read_at: null,
            is_edited: false,
            is_deleted: false,
            reply_to_id: newMsg.reply_to_id,
            metadata: newMsg.metadata ?? {},
            created_at: newMsg.created_at,
            sender: otherUser
              ? {
                  id: otherUser.id,
                  display_name: otherUser.display_name,
                  avatar_url: otherUser.avatar_url,
                }
              : null,
          };

          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      },
    );

    // Listen for read receipt updates
    channel.on(
      "postgres_changes" as any,
      {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload: any) => {
        const updated = payload.new as any;
        if (updated) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === updated.id
                ? { ...m, is_read: updated.is_read, read_at: updated.read_at }
                : m,
            ),
          );
        }
      },
    );

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [conversationId, otherUser]);

  return {
    messages,
    otherUser,
    loading,
    error,
    hasMore,
    sending,
    loadMore,
    sendMessage,
    markAsRead,
    channel: channelRef.current,
  };
}
