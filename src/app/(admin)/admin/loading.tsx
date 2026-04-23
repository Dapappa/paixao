import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 bg-[var(--color-surface-elevated)]" />
            <Skeleton className="mt-2 h-4 w-64 bg-[var(--color-surface-elevated)]" />
          </div>
          <Skeleton className="h-9 w-28 bg-[var(--color-surface-elevated)]" />
        </div>

        {/* Stat cards row */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 bg-[var(--color-surface-elevated)]" />
                <Skeleton className="h-8 w-8 rounded-lg bg-[var(--color-surface-elevated)]" />
              </div>
              <Skeleton className="mt-3 h-8 w-16 bg-[var(--color-surface-elevated)]" />
              <Skeleton className="mt-2 h-3 w-32 bg-[var(--color-surface-elevated)]" />
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <Skeleton className="h-5 w-32 bg-[var(--color-surface-elevated)]" />
            <Skeleton className="mt-4 h-48 w-full rounded-lg bg-[var(--color-surface-elevated)]" />
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <Skeleton className="h-5 w-28 bg-[var(--color-surface-elevated)]" />
            <Skeleton className="mt-4 h-48 w-full rounded-lg bg-[var(--color-surface-elevated)]" />
          </div>
        </div>

        {/* Table section */}
        <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36 bg-[var(--color-surface-elevated)]" />
            <Skeleton className="h-8 w-20 bg-[var(--color-surface-elevated)]" />
          </div>

          {/* Table header */}
          <div className="mt-4 grid grid-cols-5 gap-4 border-b border-[var(--color-border)] pb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-3 w-full bg-[var(--color-surface-elevated)]"
              />
            ))}
          </div>

          {/* Table rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-5 gap-4 border-b border-[var(--color-border)]/50 py-3"
            >
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full bg-[var(--color-surface-elevated)]" />
                <Skeleton className="h-3 w-20 bg-[var(--color-surface-elevated)]" />
              </div>
              <Skeleton className="h-3 w-full bg-[var(--color-surface-elevated)]" />
              <Skeleton className="h-5 w-16 rounded-full bg-[var(--color-surface-elevated)]" />
              <Skeleton className="h-3 w-full bg-[var(--color-surface-elevated)]" />
              <Skeleton className="h-3 w-full bg-[var(--color-surface-elevated)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
