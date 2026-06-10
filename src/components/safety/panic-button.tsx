"use client";

import { useState } from "react";
import { Shield, CircleNotch, CheckCircle } from "@phosphor-icons/react/ssr";
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
import { useSafety } from "@/lib/hooks/use-safety";

/* ─────────────────────────────────────────────
   PanicButton — emergency safety button
   ───────────────────────────────────────────── */

export function PanicButton() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const { triggerPanic, loading } = useSafety();

  const handlePanic = async () => {
    const success = await triggerPanic();
    if (success) {
      setSent(true);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => {
          setSent(false);
          setConfirmOpen(true);
        }}
        className={cn(
          "fixed z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95",
          "bottom-20 right-4 md:bottom-6 md:right-6",
          "bg-[#c2185b] text-white",
          "animate-[panic-pulse_3s_ease-in-out_infinite]"
        )}
        aria-label="Emergency safety button"
      >
        <Shield weight="fill" className="h-5 w-5" />
      </button>

      {/* Global pulse keyframes */}
      <style jsx global>{`
        @keyframes panic-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(194, 24, 91, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(194, 24, 91, 0);
          }
        }
      `}</style>

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="border-zinc-800 bg-[#0a0a0a] sm:max-w-sm">
          {sent ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle weight="duotone" className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Help is on the way
              </h3>
              <p className="text-sm text-muted-foreground">
                Our moderation team has been alerted. If you are in immediate
                danger, please also contact local emergency services.
              </p>
              <Button
                variant="outline"
                className="mt-6 border-zinc-700"
                onClick={() => setConfirmOpen(false)}
              >
                Close
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-foreground">
                  <Shield weight="light" className="h-5 w-5 text-[#c2185b]" />
                  Emergency Alert
                </DialogTitle>
                <DialogDescription>
                  This will immediately alert our moderation team. Use this if
                  you feel unsafe.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-lg border border-[#c2185b]/20 bg-[#c2185b]/5 p-3">
                <p className="text-xs text-[#c2185b]/80">
                  If you are in immediate physical danger, please contact your
                  local emergency services (911) first.
                </p>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="ghost"
                  onClick={() => setConfirmOpen(false)}
                  className="text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePanic}
                  disabled={loading}
                  className="bg-[#c2185b] text-white hover:bg-[#c2185b]/90"
                >
                  {loading ? (
                    <>
                      <CircleNotch weight="bold" className="mr-2 h-4 w-4 animate-spin" />
                      Sending Alert...
                    </>
                  ) : (
                    <>
                      <Shield weight="light" className="mr-2 h-4 w-4" />
                      Send Emergency Alert
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
