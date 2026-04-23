"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface TypingIndicatorProps {
  /** The Supabase realtime channel for this conversation */
  channel: RealtimeChannel | null;
  /** Name to show (e.g. "Sarah") */
  displayName: string;
  /** Current user's id (to ignore own typing events) */
  currentUserId: string;
}

export function TypingIndicator({
  channel,
  displayName,
  currentUserId,
}: TypingIndicatorProps) {
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!channel) return;

    const handler = (payload: { payload?: { user_id?: string } }) => {
      const typingUserId = payload?.payload?.user_id;
      if (!typingUserId || typingUserId === currentUserId) return;

      setIsTyping(true);

      // Clear previous timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Hide after 3 seconds of no typing events
      timeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    };

    channel.on("broadcast" as any, { event: "typing" }, handler);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [channel, currentUserId]);

  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 px-4 py-2"
        >
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="block h-1.5 w-1.5 rounded-full bg-[#d4a574]"
                animate={{
                  y: [0, -4, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          <span className="text-xs text-white/40">
            {displayName} is typing...
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
