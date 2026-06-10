"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlass, ChatCircleDots } from "@phosphor-icons/react/ssr";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ConversationListItem } from "@/lib/hooks/use-messages";

interface ConversationListProps {
  conversations: ConversationListItem[];
  loading: boolean;
  activeConversationId?: string | null;
  onSelect?: (conversationId: string) => void;
}

function ConversationSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl p-3">
          <Skeleton className="h-11 w-11 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyConversations() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c2185b]/15 to-[#d4a574]/15 border border-white/5 mb-4">
        <ChatCircleDots weight="duotone" className="h-6 w-6 text-[#d4a574]" />
      </div>
      <p className="text-white/70 font-medium text-sm">No conversations yet</p>
      <p className="text-white/35 text-xs mt-1 max-w-[200px]">
        Match with someone to start a conversation
      </p>
    </div>
  );
}

export function ConversationList({
  conversations,
  loading,
  activeConversationId,
  onSelect,
}: ConversationListProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const params = useParams();

  const currentId = activeConversationId ?? (params?.conversationId as string);

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) =>
      c.other_user.display_name.toLowerCase().includes(q),
    );
  }, [conversations, search]);

  const handleClick = (conversationId: string) => {
    if (onSelect) {
      onSelect(conversationId);
    } else {
      router.push(`/messages/${conversationId}`);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-white/5 px-4 py-4">
        <h2 className="text-lg font-semibold text-white font-[family-name:var(--font-playfair)] mb-3">
          Messages
        </h2>
        <div className="relative">
          <MagnifyingGlass weight="light" className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="h-9 bg-[#141414] border-white/5 pl-9 text-sm text-white/80 placeholder:text-white/25 focus-visible:ring-[#c2185b]/30 focus-visible:border-[#c2185b]/30"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/5">
        {loading ? (
          <ConversationSkeleton />
        ) : filtered.length === 0 ? (
          search.trim() ? (
            <div className="px-6 py-12 text-center">
              <p className="text-white/40 text-sm">No matches found</p>
            </div>
          ) : (
            <EmptyConversations />
          )
        ) : (
          <div className="space-y-0.5 p-1.5">
            <AnimatePresence mode="popLayout">
              {filtered.map((conv) => {
                const isActive = currentId === conv.id;
                const hasUnread = conv.unread_count > 0;

                const initials =
                  conv.other_user.display_name
                    ?.split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() ?? "?";

                const preview = conv.last_message_preview
                  ? conv.last_message_preview.length > 50
                    ? conv.last_message_preview.slice(0, 50) + "..."
                    : conv.last_message_preview
                  : "No messages yet";

                const timeAgo = conv.last_message_at
                  ? formatDistanceToNow(new Date(conv.last_message_at), {
                      addSuffix: false,
                    })
                  : "";

                return (
                  <motion.button
                    key={conv.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    onClick={() => handleClick(conv.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-150",
                      "hover:bg-white/[0.03]",
                      isActive &&
                        "bg-white/[0.05] border-l-2 border-[#c2185b]",
                      !isActive && "border-l-2 border-transparent",
                    )}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <Avatar className="h-11 w-11">
                        <AvatarImage
                          src={conv.other_user.avatar_url ?? undefined}
                          alt={conv.other_user.display_name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-[#c2185b]/20 to-[#d4a574]/20 text-white/70 text-xs border border-white/5">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {/* Unread indicator */}
                      {hasUnread && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c2185b] px-1 text-[9px] font-bold text-white shadow-lg shadow-[#c2185b]/30">
                          {conv.unread_count > 99 ? "99+" : conv.unread_count}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "truncate text-sm",
                            hasUnread
                              ? "font-semibold text-white"
                              : "font-medium text-white/80",
                          )}
                        >
                          {conv.other_user.display_name}
                        </span>
                        {timeAgo && (
                          <span className="shrink-0 text-[10px] text-white/30">
                            {timeAgo}
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          "truncate text-xs mt-0.5",
                          hasUnread ? "text-white/60" : "text-white/35",
                        )}
                      >
                        {preview}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
