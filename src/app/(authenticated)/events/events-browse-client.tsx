"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { EventFilterBar } from "@/components/events/event-filter-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useEvents, type EventFilters } from "@/lib/hooks/use-events";
import { LazyMotion, domAnimation, m } from "motion/react";
import { riseIn, riseInSoft, stagger } from "@/lib/motion";
import {
  Plus,
  CalendarDots,
  CaretLeft,
  CaretRight,
  Sparkle,
} from "@phosphor-icons/react/ssr";

interface EventsBrowseClientProps {
  canCreateEvent: boolean;
}

export function EventsBrowseClient({
  canCreateEvent,
}: EventsBrowseClientProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<EventFilters>({});

  const { events, loading, error, totalCount, page, totalPages, setPage } =
    useEvents({ filters, page: 1, perPage: 12 });

  return (
    <LazyMotion features={domAnimation}>
      {/* ── Masquerade atmosphere, warmed by a real lived-in room ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Image
          src="/generated/bg-masquerade.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-[0.18]"
        />
        {/* a real cozy bedroom — wine + candle — bleeding in at the edges for warmth */}
        <Image
          src="/generated/real-ambiance.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[center_30%] opacity-[0.14] mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
        <div className="aura-field absolute inset-0 animate-aura-drift opacity-60" />
        <div className="absolute left-[12%] top-[18%] h-[420px] w-[520px] rounded-full bg-gold/[0.06] blur-[130px] animate-breath" />
        <div className="absolute bottom-[-8%] right-[-4%] h-[440px] w-[560px] rounded-full bg-accent/[0.06] blur-[120px]" />
      </div>

      <m.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative z-10 space-y-8"
      >
        {/* Page header */}
        <m.div
          variants={riseIn}
          custom={0}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-gold">
              <Sparkle weight="fill" className="h-3.5 w-3.5" />
              After dark
            </span>
            <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Rooms worth <span className="text-gradient-brand">dressing for</span>
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
              Candlelit gatherings for verified members. You&rsquo;ll know the
              guest list is real before you ever walk in.
            </p>
          </div>

          {canCreateEvent && (
            <Button
              onClick={() => router.push("/events/create")}
              size="lg"
              className="group shrink-0 shadow-glow-accent"
            >
              <Plus weight="bold" className="mr-1 h-4 w-4 transition-transform group-hover:rotate-90" />
              Open a room
            </Button>
          )}
        </m.div>

        {/* ── Ambiance band — a real night, real people in the room ── */}
        <m.div
          variants={riseIn}
          custom={1}
          className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border/40 sm:aspect-[21/8]"
        >
          <Image
            src="/generated/real-couple.webp"
            alt="A couple laughing close together by fairy light"
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover object-center"
          />
          {/* legibility + mood grade */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/75 via-transparent to-background/30" />
          <div className="absolute inset-0 flex items-end justify-between gap-4 p-5 sm:p-8">
            <div className="max-w-sm">
              <p className="font-serif text-lg italic leading-snug text-foreground sm:text-2xl">
                The lights stay low. The people are real.
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-gold/90">
                Tonight, after dark
              </p>
            </div>
            {/* who's in the room — authentic, face-obscured personas */}
            <div className="hidden shrink-0 items-center sm:flex">
              <div className="flex -space-x-3">
                {[
                  "real-persona-w",
                  "real-persona-m",
                  "real-persona-5",
                  "real-persona-7",
                ].map((src) => (
                  <span
                    key={src}
                    className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-background ring-1 ring-gold/20"
                  >
                    <Image
                      src={`/generated/${src}.webp`}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </span>
                ))}
              </div>
              <span className="ml-3 text-xs text-text-secondary">
                & others, verified
              </span>
            </div>
          </div>
        </m.div>

        {/* Filter bar */}
        <m.div variants={riseIn} custom={2}>
          <EventFilterBar filters={filters} onFiltersChange={setFilters} />
        </m.div>

        {/* Results count */}
        {!loading && totalCount > 0 && (
          <p className="text-sm text-text-secondary">
            {events.length} of {totalCount} rooms open
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-24">
            <LoadingSpinner size="lg" />
            <p className="font-serif text-sm italic text-gold/80">
              Setting the mood&hellip;
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-center">
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
          </div>
        )}

        {/* Events grid */}
        {!loading && !error && events.length > 0 && (
          <m.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {events.map((event) => (
              <m.div key={event.id} variants={riseInSoft}>
                <EventCard event={event} />
              </m.div>
            ))}
          </m.div>
        )}

        {/* Empty state */}
        {!loading && !error && events.length === 0 && (
          <EmptyState
            icon={CalendarDots}
            title="No rooms open tonight"
            description="The next one's worth the wait. Loosen your filters, or check back after dark."
            action={
              canCreateEvent
                ? {
                    label: "Open a room",
                    onClick: () => router.push("/events/create"),
                  }
                : undefined
            }
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="border-border"
            >
              <CaretLeft weight="bold" className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-text-secondary">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="border-border"
            >
              Next
              <CaretRight weight="bold" className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </m.div>

      {/* ── Atmosphere overlays ── */}
      <div className="vignette" aria-hidden />
      <div className="film-grain" aria-hidden />
    </LazyMotion>
  );
}
