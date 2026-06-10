"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { LazyMotion, domAnimation, m } from "motion/react";
import { riseIn, riseInSoft, stagger } from "@/lib/motion";
import {
  CalendarDots,
  MapPin,
  Monitor,
  Plus,
  QrCode,
  PencilSimple,
  Eye,
  UsersThree,
  Ticket,
  Sparkle,
} from "@phosphor-icons/react/ssr";
import { format } from "date-fns";
import Link from "next/link";

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */

interface RegistrationWithEvent {
  id: string;
  status: string;
  check_in_code: string;
  event: {
    id: string;
    title: string;
    slug: string;
    starts_at: string;
    ends_at: string;
    venue_city: string | null;
    format: string;
    event_type: string;
    cover_image_url: string | null;
    status: string;
    current_attendees: number;
    capacity: number | null;
  };
}

interface HostedEvent {
  id: string;
  title: string;
  slug: string;
  starts_at: string;
  ends_at: string;
  venue_city: string | null;
  format: string;
  event_type: string;
  cover_image_url: string | null;
  status: string;
  current_attendees: number;
  capacity: number | null;
  ticket_price_cents: number;
  currency: string;
}

interface MyEventsClientProps {
  registrations: RegistrationWithEvent[];
  hostedEvents: HostedEvent[];
}

/* ─────────────────────────────────────────────
   Status helpers
   ───────────────────────────────────────────── */

const statusColors: Record<string, string> = {
  confirmed: "bg-[var(--color-success)]/20 text-[var(--color-success)] border-[var(--color-success)]/30",
  checked_in: "bg-[var(--color-success)]/20 text-[var(--color-success)] border-[var(--color-success)]/30",
  waitlisted: "bg-[var(--color-warning)]/20 text-[var(--color-warning)] border-[var(--color-warning)]/30",
  pending: "bg-[var(--color-gold-muted)] text-[var(--color-gold)] border-[var(--color-gold)]/30",
  draft: "bg-muted text-muted-foreground border-border",
  pending_review: "bg-[var(--color-warning)]/20 text-[var(--color-warning)] border-[var(--color-warning)]/30",
  published: "bg-[var(--color-success)]/20 text-[var(--color-success)] border-[var(--color-success)]/30",
  cancelled: "bg-[var(--color-danger)]/20 text-[var(--color-danger)] border-[var(--color-danger)]/30",
  completed: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  confirmed: "Confirmed",
  checked_in: "Checked In",
  waitlisted: "Waitlisted",
  pending: "Pending",
  draft: "Draft",
  pending_review: "Under Review",
  published: "Published",
  cancelled: "Cancelled",
  completed: "Completed",
};

const eventTypeLabels: Record<string, string> = {
  munch: "Munch",
  play_party: "Play Party",
  workshop: "Workshop",
  social: "Social",
  dungeon: "Dungeon",
  retreat: "Retreat",
  conference: "Conference",
  other: "Other",
};

/* Anonymous masked personas for the attendee stack. */
const personaAvatars = [
  "/generated/masked-2.webp",
  "/generated/masked-3.webp",
  "/generated/masked-4.webp",
  "/generated/masked-5.webp",
  "/generated/masked-6.webp",
];

/* A small stack of masked attendee avatars + a warm count. */
function AttendeeStack({ count }: { count: number }) {
  const shown = Math.min(Math.max(count, 0), 4);
  if (shown === 0) {
    return (
      <span className="text-xs text-text-secondary">First one in?</span>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {Array.from({ length: shown }).map((_, i) => (
          <span
            key={i}
            className="relative inline-flex h-6 w-6 overflow-hidden rounded-full border border-background ring-1 ring-border"
          >
            <Image
              src={personaAvatars[i % personaAvatars.length]}
              alt=""
              fill
              sizes="24px"
              className="object-cover"
            />
          </span>
        ))}
      </div>
      <span className="text-xs text-text-secondary">{count} going</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */

export function MyEventsClient({
  registrations,
  hostedEvents,
}: MyEventsClientProps) {
  const router = useRouter();

  return (
    <LazyMotion features={domAnimation}>
      {/* ── Masquerade atmosphere — candlelit ballroom ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Image
          src="/generated/bg-masquerade.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-[0.20]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/75 to-background" />
        <div className="aura-field absolute inset-0 animate-aura-drift opacity-55" />
        <div className="absolute bottom-[-8%] left-[-4%] h-[420px] w-[540px] rounded-full bg-gold/[0.05] blur-[120px]" />
      </div>

      <m.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative z-10 space-y-8"
      >
        {/* Header */}
        <m.div
          variants={riseIn}
          custom={0}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-gold">
              <Sparkle weight="fill" className="h-3.5 w-3.5" />
              Your nights
            </span>
            <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Where you&rsquo;re <span className="text-gradient-brand">going</span>
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
              The rooms you&rsquo;ve held a seat in, and the ones you&rsquo;re
              opening for others.
            </p>
          </div>
          <Button
            onClick={() => router.push("/events/create")}
            size="lg"
            className="group shrink-0 shadow-glow-accent"
          >
            <Plus weight="bold" className="mr-1 h-4 w-4 transition-transform group-hover:rotate-90" />
            Open a room
          </Button>
        </m.div>

        {/* Tabs */}
        <m.div variants={riseIn} custom={1}>
          <Tabs defaultValue="attending" className="w-full">
            <TabsList className="w-full border border-border bg-surface/70 backdrop-blur-sm sm:w-auto">
              <TabsTrigger value="attending" className="flex-1 sm:flex-none">
                <Ticket weight="light" className="mr-1.5 h-4 w-4" />
                Attending ({registrations.length})
              </TabsTrigger>
              <TabsTrigger value="hosting" className="flex-1 sm:flex-none">
                <CalendarDots weight="light" className="mr-1.5 h-4 w-4" />
                Hosting ({hostedEvents.length})
              </TabsTrigger>
            </TabsList>

            {/* Attending tab */}
            <TabsContent value="attending" className="mt-5 space-y-4">
              {registrations.length === 0 ? (
                <EmptyState
                  icon={Ticket}
                  title="No seats held yet"
                  description="Quiet here — for now. Wander the rooms and find a night worth dressing for."
                  action={{
                    label: "Browse the rooms",
                    onClick: () => router.push("/events"),
                  }}
                />
              ) : (
                <m.div
                  initial="hidden"
                  animate="visible"
                  variants={stagger}
                  className="space-y-4"
                >
                  {registrations.map((reg) => (
                    <m.div key={reg.id} variants={riseInSoft}>
                      <Link href={`/events/${reg.event.id}`}>
                        <Card className="group border-border/60 bg-surface/60 backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:shadow-glow-accent">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              {/* Mini cover */}
                              <div className="hidden h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-accent-muted sm:block">
                                {reg.event.cover_image_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={reg.event.cover_image_url}
                                    alt=""
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gradient-to-br from-accent/30 to-transparent" />
                                )}
                              </div>

                              {/* Info */}
                              <div className="min-w-0 flex-1 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="truncate font-serif text-base font-semibold leading-tight text-foreground transition-colors group-hover:text-accent">
                                    {reg.event.title}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "shrink-0 text-[10px]",
                                      statusColors[reg.status] || ""
                                    )}
                                  >
                                    {statusLabels[reg.status] || reg.status}
                                  </Badge>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
                                  <span className="flex items-center gap-1">
                                    <CalendarDots className="h-3 w-3" />
                                    {format(
                                      new Date(reg.event.starts_at),
                                      "MMM d, yyyy 'at' h:mm a"
                                    )}
                                  </span>
                                  {reg.event.format === "virtual" ? (
                                    <span className="flex items-center gap-1">
                                      <Monitor weight="light" className="h-3 w-3" />
                                      Virtual
                                    </span>
                                  ) : (
                                    reg.event.venue_city && (
                                      <span className="flex items-center gap-1">
                                        <MapPin weight="light" className="h-3 w-3" />
                                        {reg.event.venue_city}
                                      </span>
                                    )
                                  )}
                                  <Badge
                                    variant="secondary"
                                    className="px-1.5 py-0 text-[10px]"
                                  >
                                    {eventTypeLabels[reg.event.event_type] ||
                                      reg.event.event_type}
                                  </Badge>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-0.5">
                                  <AttendeeStack
                                    count={reg.event.current_attendees}
                                  />

                                  {/* Actions */}
                                  {(reg.status === "confirmed" ||
                                    reg.status === "pending") && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs text-accent hover:text-accent"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        router.push(
                                          `/events/${reg.event.id}/check-in`
                                        );
                                      }}
                                    >
                                      <QrCode weight="light" className="mr-1 h-3 w-3" />
                                      Your pass
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </m.div>
                  ))}
                </m.div>
              )}
            </TabsContent>

            {/* Hosting tab */}
            <TabsContent value="hosting" className="mt-5 space-y-4">
              {hostedEvents.length === 0 ? (
                <EmptyState
                  icon={CalendarDots}
                  title="No rooms of your own"
                  description="No rooms open tonight. The next one's worth the wait — open one and bring the floor to life."
                  action={{
                    label: "Open a room",
                    onClick: () => router.push("/events/create"),
                  }}
                />
              ) : (
                <m.div
                  initial="hidden"
                  animate="visible"
                  variants={stagger}
                  className="space-y-4"
                >
                  {hostedEvents.map((event) => (
                    <m.div key={event.id} variants={riseInSoft}>
                      <Card className="group border-border/60 bg-surface/60 backdrop-blur-sm transition-all duration-300 hover:border-gold/30 hover:shadow-glow-gold">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {/* Mini cover */}
                            <div className="hidden h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gold-muted sm:block">
                              {event.cover_image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={event.cover_image_url}
                                  alt=""
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              ) : (
                                <div className="h-full w-full bg-gradient-to-br from-gold/30 to-transparent" />
                              )}
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="truncate font-serif text-base font-semibold leading-tight text-foreground">
                                  {event.title}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "shrink-0 text-[10px]",
                                    statusColors[event.status] || ""
                                  )}
                                >
                                  {statusLabels[event.status] || event.status}
                                </Badge>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
                                <span className="flex items-center gap-1">
                                  <CalendarDots className="h-3 w-3" />
                                  {format(
                                    new Date(event.starts_at),
                                    "MMM d, yyyy"
                                  )}
                                </span>
                                <span className="flex items-center gap-1">
                                  <UsersThree className="h-3 w-3" />
                                  {event.current_attendees}
                                  {event.capacity
                                    ? ` / ${event.capacity}`
                                    : ""}{" "}
                                  going
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="px-1.5 py-0 text-[10px]"
                                >
                                  {eventTypeLabels[event.event_type] ||
                                    event.event_type}
                                </Badge>
                              </div>

                              {/* Host actions */}
                              <div className="flex items-center gap-2 pt-0.5">
                                <Link href={`/events/${event.id}`}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-text-secondary hover:text-foreground"
                                  >
                                    <Eye weight="light" className="mr-1 h-3 w-3" />
                                    View
                                  </Button>
                                </Link>
                                {event.status === "draft" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-gold hover:text-gold"
                                    onClick={async () => {
                                      // Quick publish
                                      try {
                                        const res = await fetch(
                                          `/api/events/${event.id}`,
                                          {
                                            method: "PUT",
                                            headers: {
                                              "Content-Type":
                                                "application/json",
                                            },
                                            body: JSON.stringify({
                                              status: "published",
                                            }),
                                          }
                                        );
                                        if (res.ok) {
                                          window.location.reload();
                                        }
                                      } catch {}
                                    }}
                                  >
                                    <PencilSimple className="mr-1 h-3 w-3" />
                                    Open the doors
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </m.div>
                  ))}
                </m.div>
              )}
            </TabsContent>
          </Tabs>
        </m.div>
      </m.div>

      {/* ── Atmosphere overlays ── */}
      <div className="vignette" aria-hidden />
      <div className="film-grain" aria-hidden />
    </LazyMotion>
  );
}
