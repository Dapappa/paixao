"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function AuthenticatedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Authenticated layout error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4 text-center">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-accent)]/[0.05] blur-[100px]" />
      </div>

      <div className="relative">
        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
          <AlertTriangle className="h-8 w-8 text-[var(--color-accent)]" />
        </div>

        {/* Copy */}
        <h1 className="mt-6 font-serif text-2xl font-semibold tracking-wide text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred. Please try again."}
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
            className="gap-2 bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/dashboard")}
            className="border-[var(--color-border)]"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
