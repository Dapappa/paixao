"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { MessageRow } from "@/lib/hooks/use-messages";

interface MessageBubbleProps {
  message: MessageRow;
  isSent: boolean;
  showAvatar?: boolean;
}

export function MessageBubble({
  message,
  isSent,
  showAvatar = true,
}: MessageBubbleProps) {
  const [showTime, setShowTime] = useState(false);

  const initials =
    message.sender?.display_name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  const displayContent = message.content ?? "";
  const timestamp = format(new Date(message.created_at), "h:mm a");
  const isOptimistic = message.id.startsWith("optimistic-");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group flex gap-2 px-4 py-0.5",
        isSent ? "flex-row-reverse" : "flex-row",
      )}
      onClick={() => setShowTime((v) => !v)}
      onMouseEnter={() => setShowTime(true)}
      onMouseLeave={() => setShowTime(false)}
    >
      {/* Avatar — only for received messages */}
      {!isSent && showAvatar ? (
        <Avatar className="h-7 w-7 mt-1 shrink-0">
          <AvatarImage
            src={message.sender?.avatar_url ?? undefined}
            alt={message.sender?.display_name ?? "User"}
          />
          <AvatarFallback className="bg-[#1a1a1a] text-[10px] text-white/60 border border-white/10">
            {initials}
          </AvatarFallback>
        </Avatar>
      ) : !isSent ? (
        <div className="w-7 shrink-0" />
      ) : null}

      {/* Bubble */}
      <div className="max-w-[75%] min-w-0">
        <div
          className={cn(
            "relative rounded-2xl px-3.5 py-2 text-sm leading-relaxed break-words",
            isSent
              ? "bg-gradient-to-br from-[#c2185b] to-[#a01548] text-white rounded-br-md"
              : "bg-[#1a1a1a] text-white/90 border border-white/5 rounded-bl-md",
            isOptimistic && "opacity-60",
          )}
        >
          {displayContent}

          {/* Read receipt for sent messages */}
          {isSent && !isOptimistic && (
            <span className="inline-flex ml-1.5 align-bottom">
              {message.read_at ? (
                <CheckCheck className="h-3.5 w-3.5 text-white/60" />
              ) : (
                <Check className="h-3.5 w-3.5 text-white/40" />
              )}
            </span>
          )}
        </div>

        {/* Timestamp — shown on hover/tap */}
        <div
          className={cn(
            "transition-all duration-200 overflow-hidden",
            showTime
              ? "max-h-6 opacity-100 mt-0.5"
              : "max-h-0 opacity-0",
          )}
        >
          <span
            className={cn(
              "text-[10px] text-white/30 px-1",
              isSent ? "float-right" : "float-left",
            )}
          >
            {timestamp}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
