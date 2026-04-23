"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConversationList } from "@/components/messages/conversation-list";
import { MessageThread } from "@/components/messages/message-thread";
import { MessageInput } from "@/components/messages/message-input";
import { EncryptionBadge } from "@/components/messages/encryption-badge";
import { useConversations, useMessages } from "@/lib/hooks/use-messages";
import { useAuth } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";

interface MessagesClientProps {
  /** When used inside [conversationId] page, pre-select this conversation */
  initialConversationId?: string;
}

export function MessagesClient({ initialConversationId }: MessagesClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const currentUserId = user?.id ?? "";

  const [selectedId, setSelectedId] = useState<string | null>(
    initialConversationId ?? null,
  );

  const { conversations, loading: convLoading } = useConversations();
  const {
    messages,
    otherUser,
    loading: msgLoading,
    hasMore,
    sending,
    loadMore,
    sendMessage,
    markAsRead,
    channel,
  } = useMessages(selectedId);

  // Mark as read when conversation is opened
  useEffect(() => {
    if (selectedId && messages.length > 0) {
      markAsRead();
    }
  }, [selectedId, messages.length, markAsRead]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      setSelectedId(id);
      // Update URL on desktop without full navigation
      window.history.replaceState(null, "", `/messages/${id}`);
    },
    [],
  );

  const handleBack = useCallback(() => {
    setSelectedId(null);
    window.history.replaceState(null, "", "/messages");
  }, []);

  const handleSend = useCallback(
    (content: string) => {
      sendMessage(content);
    },
    [sendMessage],
  );

  const otherInitials =
    otherUser?.display_name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  const isEncrypted = !!(otherUser?.public_key);

  return (
    <div className="flex h-[calc(100dvh-4rem)] md:h-[calc(100dvh-4rem)]">
      {/* ── Conversation List (left panel) ── */}
      <div
        className={cn(
          "w-full md:w-80 md:shrink-0 md:border-r md:border-white/5 bg-[#0a0a0a]",
          // On mobile: hide when a conversation is selected
          selectedId ? "hidden md:flex md:flex-col" : "flex flex-col",
        )}
      >
        <ConversationList
          conversations={conversations}
          loading={convLoading}
          activeConversationId={selectedId}
          onSelect={handleSelectConversation}
        />
      </div>

      {/* ── Message Area (right panel) ── */}
      <div
        className={cn(
          "flex-1 flex flex-col bg-[#0d0d0d]",
          // On mobile: hide when no conversation selected
          !selectedId ? "hidden md:flex" : "flex",
        )}
      >
        {selectedId && otherUser ? (
          <>
            {/* Conversation header */}
            <div className="flex items-center gap-3 border-b border-white/5 bg-[#0a0a0a] px-4 py-3 shrink-0">
              {/* Back button (mobile) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="md:hidden h-8 w-8 text-white/60 hover:text-white hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={otherUser.avatar_url ?? undefined}
                  alt={otherUser.display_name ?? "User"}
                />
                <AvatarFallback className="bg-gradient-to-br from-[#c2185b]/20 to-[#d4a574]/20 text-white/70 text-xs border border-white/5">
                  {otherInitials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">
                  {otherUser.display_name ?? "Unknown"}
                </p>
                <EncryptionBadge isEncrypted={isEncrypted} />
              </div>
            </div>

            {/* Messages */}
            <MessageThread
              messages={messages}
              currentUserId={currentUserId}
              loading={msgLoading}
              hasMore={hasMore}
              onLoadMore={loadMore}
              channel={channel}
              otherUser={otherUser}
            />

            {/* Input */}
            <MessageInput
              onSend={handleSend}
              disabled={sending}
              channel={channel}
              currentUserId={currentUserId}
            />
          </>
        ) : (
          /* Empty state — no conversation selected (desktop) */
          <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c2185b]/10 to-[#d4a574]/10 border border-white/5">
                <ShieldCheck className="h-8 w-8 text-[#d4a574]/60" />
              </div>
              <div>
                <p className="text-white/60 font-medium font-[family-name:var(--font-playfair)] text-lg">
                  Your messages
                </p>
                <p className="text-white/30 text-sm mt-1 max-w-[280px]">
                  Select a conversation to start messaging. All conversations
                  are between matched users.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
