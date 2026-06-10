import { Skeleton } from "@/components/ui/skeleton";

export default function MatchesLoading() {
  return (
    <div>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-40 bg-[var(--color-surface-elevated)]" />
            <Skeleton className="mt-2 h-4 w-56 bg-[var(--color-surface-elevated)]" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-lg bg-[var(--color-surface-elevated)]" />
            <Skeleton className="h-9 w-24 rounded-lg bg-[var(--color-surface-elevated)]" />
          </div>
        </div>

        {/* Nav tabs */}
        <div className="mt-6 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-10 w-28 rounded-lg bg-[var(--color-surface-elevated)]"
            />
          ))}
        </div>

        {/* Match card stack */}
        <div className="mt-8 flex justify-center">
          <div className="relative h-[480px] w-full max-w-sm">
            {/* Stacked cards */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                style={{
                  transform: `scale(${1 - i * 0.04}) translateY(${i * 8}px)`,
                  opacity: 1 - i * 0.2,
                  zIndex: 3 - i,
                }}
              >
                {/* Photo area */}
                <Skeleton className="h-[340px] w-full rounded-t-2xl bg-[var(--color-surface-elevated)]" />

                {/* Info area */}
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-32 bg-[var(--color-surface-elevated)]" />
                    <Skeleton className="h-5 w-8 bg-[var(--color-surface-elevated)]" />
                  </div>
                  <Skeleton className="mt-2 h-4 w-48 bg-[var(--color-surface-elevated)]" />
                  <div className="mt-3 flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full bg-[var(--color-surface-elevated)]" />
                    <Skeleton className="h-6 w-20 rounded-full bg-[var(--color-surface-elevated)]" />
                    <Skeleton className="h-6 w-14 rounded-full bg-[var(--color-surface-elevated)]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex justify-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full bg-[var(--color-surface-elevated)]" />
          <Skeleton className="h-14 w-14 rounded-full bg-[var(--color-surface-elevated)]" />
          <Skeleton className="h-14 w-14 rounded-full bg-[var(--color-surface-elevated)]" />
        </div>
      </div>
    </div>
  );
}
