import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
      {/* ── Ambient aura backdrop (Velvet Aura) ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.18] mix-blend-screen"
          style={{ backgroundImage: "url(/generated/bg-bar.webp)" }}
        />
        <div className="aura-field absolute inset-0 animate-aura-drift opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
      </div>

      <div className="relative z-10 px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 bg-surface-elevated" />
              <Skeleton className="mt-2 h-4 w-32 bg-surface-elevated" />
            </div>
            <Skeleton className="h-9 w-32 bg-surface-elevated" />
          </div>

          {/* Filter tabs */}
          <div className="mt-6 flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-9 w-24 rounded-full bg-surface-elevated"
              />
            ))}
          </div>

          {/* Notification groups */}
          <div className="mt-6 space-y-6">
            {/* Today group */}
            <div>
              <Skeleton className="mb-2 h-4 w-16 bg-surface-elevated" />
              <div className="space-y-1 rounded-2xl border border-border/50 bg-surface/50 p-2 backdrop-blur-sm">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 px-4 py-3">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-surface-elevated" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 bg-surface-elevated" />
                      <Skeleton className="h-3 w-1/2 bg-surface-elevated" />
                      <Skeleton className="h-3 w-20 bg-surface-elevated" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Yesterday group */}
            <div>
              <Skeleton className="mb-2 h-4 w-24 bg-surface-elevated" />
              <div className="space-y-1 rounded-2xl border border-border/50 bg-surface/50 p-2 backdrop-blur-sm">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex gap-3 px-4 py-3">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-surface-elevated" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3 bg-surface-elevated" />
                      <Skeleton className="h-3 w-1/3 bg-surface-elevated" />
                      <Skeleton className="h-3 w-20 bg-surface-elevated" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Warm loading cue */}
          <p className="mt-10 text-center font-serif text-sm italic text-gold/70">
            Setting the mood&hellip;
          </p>
        </div>
      </div>
    </div>
  );
}
