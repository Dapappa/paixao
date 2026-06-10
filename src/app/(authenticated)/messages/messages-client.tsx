"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart } from "@phosphor-icons/react/ssr";
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
    <div className="relative -mx-5 -mt-8 -mb-24 flex h-[calc(100dvh-5rem)] overflow-hidden border-y border-border/40 sm:-mx-7 md:-mb-12 lg:-mx-10">
      {/* ── Velvet Aura backdrop — a low-lit booth (bg-bar) ── */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.22]"
          style={{ backgroundImage: "url(/generated/bg-bar.webp)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background/90" />
        <div className="aura-field absolute inset-0 animate-aura-drift opacity-50" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[420px] w-[520px] rounded-full bg-accent/[0.06] blur-[130px]" />
        <div className="absolute right-[-8%] top-[-15%] h-[360px] w-[460px] rounded-full bg-gold/[0.05] blur-[120px]" />
      </div>

      {/* ── Conversation List (left panel) ── */}
      <div
        className={cn(
          "relative z-10 w-full md:w-80 md:shrink-0 md:border-r md:border-border/60 bg-background/40 backdrop-blur-xl",
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
          "relative z-10 flex-1 flex flex-col bg-background/30 backdrop-blur-xl",
          // On mobile: hide when no conversation selected
          !selectedId ? "hidden md:flex" : "flex",
        )}
      >
        {selectedId && otherUser ? (
          <>
            {/* Conversation header */}
            <div className="flex items-center gap-3 border-b border-border/60 bg-background/50 px-4 py-3 shrink-0 backdrop-blur-xl">
              {/* Back button (mobile) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="md:hidden h-8 w-8 text-text-secondary hover:text-foreground hover:bg-surface/60"
              >
                <ArrowLeft weight="bold" className="h-4 w-4" />
              </Button>

              <Avatar className="h-9 w-9 ring-1 ring-border/60">
                <AvatarImage
                  src={otherUser.avatar_url ?? undefined}
                  alt={otherUser.display_name ?? "User"}
                />
                <AvatarFallback className="bg-gradient-to-br from-accent/25 to-gold/20 text-foreground/80 text-xs border border-border/50">
                  {otherInitials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate font-serif">
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
          <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.05, 0.7, 0.1, 1] }}
              className="space-y-5"
            >
              <div className="mx-auto flex h-20 w-20 animate-breath items-center justify-center rounded-2xl border border-border/50 bg-gradient-to-br from-accent/12 to-gold/10 shadow-glow-accent">
                <Heart weight="duotone" className="h-8 w-8 text-accent/70" />
              </div>
              <div>
                <p className="font-serif text-xl italic text-foreground/80">
                  Someone&rsquo;s thinking of you.
                </p>
                <p className="mx-auto mt-2 max-w-[300px] text-sm leading-relaxed text-text-secondary">
                  Pick a conversation and lean in. Every thread here is between
                  two people who&rsquo;ve already said yes to each other.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
