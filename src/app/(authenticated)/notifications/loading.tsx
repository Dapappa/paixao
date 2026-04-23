import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 bg-[var(--color-surface-elevated)]" />
            <Skeleton className="mt-2 h-4 w-32 bg-[var(--color-surface-elevated)]" />
          </div>
          <Skeleton className="h-9 w-32 bg-[var(--color-surface-elevated)]" />
        </div>

        {/* Filter tabs */}
        <div className="mt-6 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-9 w-24 rounded-full bg-[var(--color-surface-elevated)]"
            />
          ))}
        </div>

        {/* Notification groups */}
        <div className="mt-6 space-y-6">
          {/* Today group */}
          <div>
            <Skeleton className="mb-2 h-4 w-16 bg-[var(--color-surface-elevated)]" />
            <div className="space-y-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-3">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-[var(--color-surface-elevated)]" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-[var(--color-surface-elevated)]" />
                    <Skeleton className="h-3 w-1/2 bg-[var(--color-surface-elevated)]" />
                    <Skeleton className="h-3 w-20 bg-[var(--color-surface-elevated)]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Yesterday group */}
          <div>
            <Skeleton className="mb-2 h-4 w-24 bg-[var(--color-surface-elevated)]" />
            <div className="space-y-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-3">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-[var(--color-surface-elevated)]" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3 bg-[var(--color-surface-elevated)]" />
                    <Skeleton className="h-3 w-1/3 bg-[var(--color-surface-elevated)]" />
                    <Skeleton className="h-3 w-20 bg-[var(--color-surface-elevated)]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
