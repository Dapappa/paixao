"use client";

import { useCallback, useRef, useState } from "react";
import { PaperPlaneTilt } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  /** Supabase Realtime channel for broadcasting typing events */
  channel: RealtimeChannel | null;
  /** Current user's id for typing broadcasts */
  currentUserId: string;
}

export function MessageInput({
  onSend,
  disabled,
  channel,
  currentUserId,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    // Min 1 row (~40px), max 4 rows (~120px)
    const maxHeight = 120;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  const broadcastTyping = useCallback(() => {
    if (!channel) return;

    channel.send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: currentUserId },
    });

    // Debounce: don't send again for 2s
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 2000);
  }, [channel, currentUserId]);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setValue("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      adjustHeight();

      // Broadcast typing if not already within debounce window
      if (!typingTimeoutRef.current) {
        broadcastTyping();
      }
    },
    [adjustHeight, broadcastTyping],
  );

  const isEmpty = value.trim().length === 0;

  return (
    <div className="border-t border-white/5 bg-[#0a0a0a] px-4 py-3">
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled}
            rows={1}
            className={cn(
              "w-full resize-none rounded-xl border bg-[#141414] px-4 py-2.5 text-sm text-white/90",
              "placeholder:text-white/30",
              "focus:outline-none focus:border-[#c2185b]/50 focus:ring-1 focus:ring-[#c2185b]/25",
              "border-white/10 transition-colors",
              "scrollbar-thin scrollbar-thumb-white/10",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
            style={{ minHeight: "40px", maxHeight: "120px" }}
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={isEmpty || disabled}
          size="icon"
          className={cn(
            "h-10 w-10 shrink-0 rounded-xl transition-all duration-200",
            isEmpty || disabled
              ? "bg-white/5 text-white/20 cursor-not-allowed"
              : "bg-gradient-to-br from-[#c2185b] to-[#a01548] text-white hover:from-[#d4266b] hover:to-[#b51a55] shadow-lg shadow-[#c2185b]/20",
          )}
        >
          <PaperPlaneTilt weight="fill" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
