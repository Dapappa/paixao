"use client";

import { useState } from "react";
import { Prohibit, CircleNotch, UserCheck } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/* ─────────────────────────────────────────────
   Props
   ───────────────────────────────────────────── */

interface BlockButtonProps {
  userId: string;
  isBlocked: boolean;
  onBlock?: () => void | Promise<void>;
  onUnblock?: () => void | Promise<void>;
  className?: string;
  variant?: "default" | "icon";
}

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */

export function BlockButton({
  userId,
  isBlocked,
  onBlock,
  onUnblock,
  className,
  variant = "default",
}: BlockButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
    setLoading(true);
    try {
      await onBlock?.();
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  const handleUnblock = async () => {
    setLoading(true);
    try {
      await onUnblock?.();
    } finally {
      setLoading(false);
    }
  };

  if (isBlocked) {
    return (
      <Button
        variant="outline"
        size={variant === "icon" ? "icon" : "default"}
        onClick={handleUnblock}
        disabled={loading}
        className={cn(
          "border-zinc-700 text-muted-foreground hover:text-foreground",
          className
        )}
      >
        {loading ? (
          <CircleNotch weight="bold" className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <UserCheck weight="light" className="h-4 w-4" />
            {variant !== "icon" && <span className="ml-2">Unblock User</span>}
          </>
        )}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size={variant === "icon" ? "icon" : "default"}
        onClick={() => setConfirmOpen(true)}
        className={cn(
          "border-red-500/30 text-red-400 hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-300",
          className
        )}
      >
        <Prohibit weight="light" className="h-4 w-4" />
        {variant !== "icon" && <span className="ml-2">Block User</span>}
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="border-zinc-800 bg-[#0a0a0a] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Prohibit weight="light" className="h-5 w-5 text-[#c2185b]" />
              Block this user?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This action will have the following effects:
            </DialogDescription>
          </DialogHeader>

          <ul className="space-y-2 py-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c2185b]" />
              Your match with this person will be removed
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c2185b]" />
              Your profiles will be hidden from each other
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c2185b]" />
              You will no longer be able to exchange messages
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c2185b]" />
              Unblocking later will not restore the match or conversation
            </li>
          </ul>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBlock}
              disabled={loading}
              className="bg-[#c2185b] text-white hover:bg-[#c2185b]/90"
            >
              {loading ? (
                <>
                  <CircleNotch weight="bold" className="mr-2 h-4 w-4 animate-spin" />
                  Blocking...
                </>
              ) : (
                <>
                  <Prohibit weight="light" className="mr-2 h-4 w-4" />
                  Block User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
