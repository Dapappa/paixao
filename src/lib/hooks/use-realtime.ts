"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export interface RealtimeSubscriptionConfig {
  /** Postgres table to subscribe to */
  table: string;
  /** Schema (default "public") */
  schema?: string;
  /** Postgres change event type */
  event: "INSERT" | "UPDATE" | "DELETE" | "*";
  /** Optional filter, e.g. `conversation_id=eq.abc-123` */
  filter?: string;
  /** Callback invoked with the realtime payload */
  callback: (payload: any) => void;
}

export interface UseRealtimeReturn {
  status: ConnectionStatus;
  channel: RealtimeChannel | null;
}

/* ─────────────────────────────────────────────
   Hook: useRealtimeSubscription
   ───────────────────────────────────────────── */

/**
 * Generic Supabase Realtime wrapper.
 *
 * Subscribes on mount, unsubscribes on cleanup.
 * Returns the current connection status.
 */
export function useRealtimeSubscription(
  channelName: string,
  config: RealtimeSubscriptionConfig | null,
): UseRealtimeReturn {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!config) {
      setStatus("disconnected");
      return;
    }

    const supabase = createClient();
    const channel = supabase.channel(channelName);

    channel.on(
      "postgres_changes" as any,
      {
        event: config.event,
        schema: config.schema ?? "public",
        table: config.table,
        filter: config.filter,
      },
      (payload: any) => {
        config.callback(payload);
      },
    );

    channel.subscribe((subscriptionStatus: string) => {
      if (subscriptionStatus === "SUBSCRIBED") {
        setStatus("connected");
      } else if (
        subscriptionStatus === "CLOSED" ||
        subscriptionStatus === "CHANNEL_ERROR"
      ) {
        setStatus("disconnected");
      } else {
        setStatus("connecting");
      }
    });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, config?.table, config?.event, config?.filter]);

  return { status, channel: channelRef.current };
}
