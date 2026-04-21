"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Clock,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export type RSVPState =
  | "available"
  | "registered"
  | "waitlisted"
  | "sold_out"
  | "cancelled"
  | "past"
  | "loading";

interface RSVPButtonProps {
  state: RSVPState;
  onRegister?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function RSVPButton({
  state,
  onRegister,
  onCancel,
  disabled = false,
  className,
}: RSVPButtonProps) {
  const [hovering, setHovering] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleClick = async () => {
    if (actionLoading || disabled) return;

    setActionLoading(true);
    try {
      if (state === "available" && onRegister) {
        await onRegister();
      } else if (state === "registered" && hovering && onCancel) {
        await onCancel();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const isDisabled =
    disabled ||
    actionLoading ||
    state === "sold_out" ||
    state === "past" ||
    state === "loading";

  const getButtonContent = () => {
    if (actionLoading || state === "loading") {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing...</span>
        </>
      );
    }

    switch (state) {
      case "available":
        return <span>Register for Event</span>;

      case "registered":
        if (hovering) {
          return (
            <>
              <XCircle className="h-4 w-4" />
              <span>Cancel Registration</span>
            </>
          );
        }
        return (
          <>
            <Check className="h-4 w-4" />
            <span>Registered</span>
          </>
        );

      case "waitlisted":
        return (
          <>
            <Clock className="h-4 w-4" />
            <span>Waitlisted</span>
          </>
        );

      case "sold_out":
        return (
          <>
            <AlertTriangle className="h-4 w-4" />
            <span>Sold Out</span>
          </>
        );

      case "cancelled":
        return <span>Registration Cancelled</span>;

      case "past":
        return <span>Event Has Ended</span>;

      default:
        return <span>Register</span>;
    }
  };

  const getButtonVariant = () => {
    if (state === "registered" && hovering) return "destructive";
    if (state === "registered") return "outline";
    if (state === "waitlisted") return "secondary";
    if (state === "sold_out" || state === "past" || state === "cancelled")
      return "secondary";
    return "default";
  };

  return (
    <motion.div
      className={cn("w-full", className)}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
    >
      <Button
        size="lg"
        variant={getButtonVariant()}
        disabled={isDisabled}
        onClick={handleClick}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className={cn(
          "w-full text-base font-semibold transition-all duration-200",
          state === "available" &&
            "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-[0_0_20px_rgba(194,24,91,0.2)] hover:shadow-[0_0_30px_rgba(194,24,91,0.4)]",
          state === "registered" &&
            !hovering &&
            "border-[var(--color-success)] text-[var(--color-success)] bg-transparent hover:bg-transparent"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={`${state}-${hovering}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-2"
          >
            {getButtonContent()}
          </motion.span>
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}
