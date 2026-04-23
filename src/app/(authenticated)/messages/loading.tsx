import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesLoading() {
  return (
    <div className="flex h-[calc(100dvh-4rem)]">
      {/* Conversation sidebar */}
      <div className="w-full border-r border-[var(--color-border)] md:w-80 lg:w-96">
        {/* Search bar */}
        <div className="border-b border-[var(--color-border)] p-4">
          <Skeleton className="h-10 w-full rounded-lg bg-[var(--color-surface-elevated)]" />
        </div>

        {/* Conversation list */}
        <div className="space-y-1 p-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg px-3 py-3"
            >
              {/* Avatar */}
              <Skeleton className="h-12 w-12 shrink-0 rounded-full bg-[var(--color-surface-elevated)]" />

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24 bg-[var(--color-surface-elevated)]" />
                  <Skeleton className="h-3 w-10 bg-[var(--color-surface-elevated)]" />
                </div>
                <Skeleton className="mt-1.5 h-3 w-full bg-[var(--color-surface-elevated)]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Thread area (hidden on mobile) */}
      <div className="hidden flex-1 flex-col md:flex">
        {/* Thread header */}
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-6 py-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-[var(--color-surface-elevated)]" />
          <div>
            <Skeleton className="h-4 w-28 bg-[var(--color-surface-elevated)]" />
            <Skeleton className="mt-1 h-3 w-16 bg-[var(--color-surface-elevated)]" />
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 space-y-4 p-6">
          {/* Received message */}
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full bg-[var(--color-surface-elevated)]" />
            <Skeleton className="h-16 w-64 rounded-2xl rounded-tl-sm bg-[var(--color-surface-elevated)]" />
          </div>
          {/* Sent message */}
          <div className="flex justify-end">
            <Skeleton className="h-10 w-48 rounded-2xl rounded-tr-sm bg-[var(--color-accent)]/10" />
          </div>
          {/* Received */}
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full bg-[var(--color-surface-elevated)]" />
            <Skeleton className="h-12 w-52 rounded-2xl rounded-tl-sm bg-[var(--color-surface-elevated)]" />
          </div>
          {/* Sent */}
          <div className="flex justify-end">
            <Skeleton className="h-14 w-56 rounded-2xl rounded-tr-sm bg-[var(--color-accent)]/10" />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-[var(--color-border)] p-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 flex-1 rounded-lg bg-[var(--color-surface-elevated)]" />
            <Skeleton className="h-10 w-10 rounded-lg bg-[var(--color-surface-elevated)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
