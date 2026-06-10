import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesLoading() {
  return (
    <div className="relative -mx-5 -mt-8 -mb-24 flex h-[calc(100dvh-5rem)] overflow-hidden border-y border-border/40 sm:-mx-7 md:-mb-12 lg:-mx-10">
      {/* ── Velvet Aura backdrop — a low-lit booth (bg-bar) ── */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.22]"
          style={{ backgroundImage: "url(/generated/bg-bar.webp)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background/90" />
        <div className="aura-field absolute inset-0 animate-aura-drift opacity-50" />
      </div>

      {/* Conversation sidebar */}
      <div className="relative z-10 w-full shrink-0 border-r border-border/60 bg-background/40 backdrop-blur-xl md:w-80">
        {/* Search bar */}
        <div className="border-b border-border/60 p-4">
          <Skeleton className="h-10 w-full rounded-lg bg-surface/70" />
        </div>

        {/* Conversation list */}
        <div className="space-y-1 p-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg px-3 py-3"
            >
              {/* Avatar */}
              <Skeleton className="h-12 w-12 shrink-0 rounded-full bg-surface/70" />

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24 bg-surface/70" />
                  <Skeleton className="h-3 w-10 bg-surface/70" />
                </div>
                <Skeleton className="mt-1.5 h-3 w-full bg-surface/70" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Thread area (hidden on mobile) */}
      <div className="relative z-10 hidden flex-1 flex-col bg-background/30 backdrop-blur-xl md:flex">
        {/* Thread header */}
        <div className="flex items-center gap-3 border-b border-border/60 bg-background/50 px-6 py-4 backdrop-blur-xl">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-surface/70" />
          <div>
            <Skeleton className="h-4 w-28 bg-surface/70" />
            <Skeleton className="mt-1 h-3 w-16 bg-surface/70" />
          </div>
        </div>

        {/* Messages area */}
        <div className="relative flex-1 space-y-4 p-6">
          {/* Received message */}
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full bg-surface/70" />
            <Skeleton className="h-16 w-64 rounded-2xl rounded-tl-sm bg-surface/70" />
          </div>
          {/* Sent message */}
          <div className="flex justify-end">
            <Skeleton className="h-10 w-48 rounded-2xl rounded-tr-sm bg-accent/10" />
          </div>
          {/* Received */}
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full bg-surface/70" />
            <Skeleton className="h-12 w-52 rounded-2xl rounded-tl-sm bg-surface/70" />
          </div>
          {/* Sent */}
          <div className="flex justify-end">
            <Skeleton className="h-14 w-56 rounded-2xl rounded-tr-sm bg-accent/10" />
          </div>

          {/* Warm loading whisper */}
          <p className="pointer-events-none absolute inset-x-0 bottom-10 text-center font-serif text-sm italic text-text-secondary">
            Setting the mood&hellip;
          </p>
        </div>

        {/* Input area */}
        <div className="border-t border-border/60 p-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 flex-1 rounded-lg bg-surface/70" />
            <Skeleton className="h-10 w-10 rounded-lg bg-surface/70" />
          </div>
        </div>
      </div>
    </div>
  );
}
