"use client";

import { useEffect, useRef, useCallback } from "react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { motion } from "framer-motion";
import { ChatText } from "@phosphor-icons/react/ssr";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import type { MessageRow, OtherUser } from "@/lib/hooks/use-messages";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface MessageThreadProps {
  messages: MessageRow[];
  currentUserId: string;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  /** Realtime channel for typing indicator */
  channel: RealtimeChannel | null;
  otherUser: OtherUser | null;
}

function formatDateDivider(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

function MessageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`flex gap-2 ${i % 3 === 0 ? "flex-row-reverse" : ""}`}
        >
          {i % 3 !== 0 && <Skeleton className="h-7 w-7 rounded-full shrink-0" />}
          <Skeleton
            className={`h-10 rounded-2xl ${
              i % 2 === 0 ? "w-[60%]" : "w-[40%]"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-1 flex-col items-center justify-center gap-4 text-center px-8"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c2185b]/20 to-[#d4a574]/20 border border-white/5">
        <ChatText weight="duotone" className="h-7 w-7 text-[#c2185b]" />
      </div>
      <div>
        <p className="text-white/80 font-medium font-[family-name:var(--font-playfair)]">
          Start the conversation
        </p>
        <p className="text-white/40 text-sm mt-1">
          Say hello and break the ice.
        </p>
      </div>
    </motion.div>
  );
}

export function MessageThread({
  messages,
  currentUserId,
  loading,
  hasMore,
  onLoadMore,
  channel,
  otherUser,
}: MessageThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);

  // Auto-scroll to bottom on new messages (if already at bottom)
  useEffect(() => {
    const isNewMessage = messages.length > prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    if (isNewMessage && isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!loading && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
    }
  }, [loading, messages.length === 0]);

  // Track if user is at bottom
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const threshold = 100;
    isAtBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  // IntersectionObserver for infinite scroll (load older messages)
  useEffect(() => {
    if (!topSentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(topSentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 overflow-hidden">
        <MessageSkeleton />
      </div>
    );
  }

  if (messages.length === 0) {
    return <EmptyState />;
  }

  // Group messages by date for dividers
  const groupedMessages: { date: string; messages: MessageRow[] }[] = [];
  let currentDate = "";

  for (const msg of messages) {
    const msgDate = new Date(msg.created_at);
    const dateKey = format(msgDate, "yyyy-MM-dd");

    if (dateKey !== currentDate) {
      currentDate = dateKey;
      groupedMessages.push({ date: msg.created_at, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  }

  return (
    <ScrollArea className="flex-1">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex flex-col min-h-full"
      >
        {/* Top sentinel for infinite scroll */}
        {hasMore && (
          <div ref={topSentinelRef} className="h-1 w-full">
            {loading && (
              <div className="flex justify-center py-4">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-[#c2185b]/50"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Messages grouped by date */}
        {groupedMessages.map((group, gi) => (
          <div key={gi}>
            {/* Date divider */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[10px] font-medium uppercase tracking-widest text-white/25">
                {formatDateDivider(group.date)}
              </span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            {/* Messages in this day */}
            {group.messages.map((msg, mi) => {
              const isSent = msg.sender_id === currentUserId;
              // Show avatar if previous message is from a different sender
              const prevMsg = mi > 0 ? group.messages[mi - 1] : null;
              const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id;

              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isSent={isSent}
                  showAvatar={showAvatar}
                />
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        <TypingIndicator
          channel={channel}
          displayName={otherUser?.display_name ?? "Someone"}
          currentUserId={currentUserId}
        />

        {/* Bottom anchor for auto-scroll */}
        <div ref={bottomRef} className="h-1" />
      </div>
    </ScrollArea>
  );
}
