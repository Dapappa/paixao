"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Warning, ArrowCounterClockwise, Shield } from "@phosphor-icons/react/ssr";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin layout error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4 text-center">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/[0.04] blur-[100px]" />
      </div>

      <div className="relative">
        {/* Admin badge */}
        <div className="mx-auto mb-4 flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1">
          <Shield weight="light" className="h-3 w-3 text-[var(--color-gold)]" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-gold)]">
            Admin Panel
          </span>
        </div>

        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
          <Warning weight="duotone" className="h-8 w-8 text-orange-400" />
        </div>

        {/* Copy */}
        <h1 className="mt-6 font-serif text-2xl font-semibold tracking-wide text-foreground">
          Admin Error
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred in the admin panel."}
        </p>

        {error.digest && (
          <p className="mt-2 text-xs text-muted-foreground/50">
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            onClick={reset}
            className="gap-2 bg-[var(--color-gold)] text-black hover:bg-[var(--color-gold)]/90"
          >
            <ArrowCounterClockwise weight="bold" className="h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/admin")}
            className="border-[var(--color-border)]"
          >
            Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
