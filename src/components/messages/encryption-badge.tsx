"use client";

import { Lock, LockOpen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface EncryptionBadgeProps {
  /** Whether both users have public keys set */
  isEncrypted: boolean;
  className?: string;
}

export function EncryptionBadge({
  isEncrypted,
  className,
}: EncryptionBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase transition-colors",
              isEncrypted
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-white/5 text-white/40 border border-white/10",
              className,
            )}
          >
            {isEncrypted ? (
              <Lock className="h-2.5 w-2.5" />
            ) : (
              <LockOpen className="h-2.5 w-2.5" />
            )}
            Encrypted
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="max-w-[200px] bg-[#1a1a1a] border-white/10 text-white/70 text-xs"
        >
          {isEncrypted
            ? "Messages in this conversation are end-to-end encrypted. Only you and the other person can read them."
            : "End-to-end encryption is not yet active. Both users need to set up encryption keys."}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
