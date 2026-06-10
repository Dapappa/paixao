"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { EventRulesDisplay } from "./event-rules-display";
import { EventAttendees } from "./event-attendees";
import { motion } from "framer-motion";
import {
  CalendarDots,
  Clock,
  MapPin,
  Monitor,
  Globe,
  TShirt,
  Wine,
  ForkKnife,
  Shield,
  UsersThree,
  Ticket,
  ArrowSquareOut,
  Crown,
} from "@phosphor-icons/react/ssr";
import { format } from "date-fns";
import Link from "next/link";
import type { EventWithHost } from "@/lib/hooks/use-events";

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

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

const formatLabels: Record<string, string> = {
  in_person: "In Person",
  virtual: "Virtual",
  hybrid: "Hybrid",
};

const gradientsByType: Record<string, string> = {
  munch: "from-rose-900/80 via-pink-900/50 to-[#0a0a0a]",
  play_party: "from-purple-900/80 via-fuchsia-900/50 to-[#0a0a0a]",
  workshop: "from-amber-900/80 via-orange-900/50 to-[#0a0a0a]",
  social: "from-sky-900/80 via-blue-900/50 to-[#0a0a0a]",
  dungeon: "from-red-900/80 via-rose-900/50 to-[#0a0a0a]",
  retreat: "from-emerald-900/80 via-teal-900/50 to-[#0a0a0a]",
  conference: "from-indigo-900/80 via-violet-900/50 to-[#0a0a0a]",
  other: "from-gray-900/80 via-neutral-900/50 to-[#0a0a0a]",
};

function formatPrice(cents: number, currency: string): string {
  if (cents === 0) return "Free";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

/* ─────────────────────────────────────────────
   Props
   ───────────────────────────────────────────── */

interface EventDetailViewProps {
  event: EventWithHost;
  /** Is the current user registered for this event? */
  isRegistered?: boolean;
  /** Slot for the RSVP / action button(s) */
  actionSlot?: React.ReactNode;
  /** Slot for the QR code card */
  qrSlot?: React.ReactNode;
  className?: string;
}

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */

export function EventDetailView({
  event,
  isRegistered = false,
  actionSlot,
  qrSlot,
  className,
}: EventDetailViewProps) {
  const startsAt = new Date(event.starts_at);
  const endsAt = new Date(event.ends_at);
  const isVirtual = event.format === "virtual" || event.format === "hybrid";
  const isInPerson = event.format === "in_person" || event.format === "hybrid";
  const gradient =
    gradientsByType[event.event_type] || gradientsByType.other;
  const capacityPercent =
    event.capacity && event.capacity > 0
      ? Math.min((event.current_attendees / event.capacity) * 100, 100)
      : 0;

  return (
    <div className={cn("pb-12", className)}>
      {/* ───── Hero ───── */}
      <div className="relative -mx-5 sm:-mx-7 lg:-mx-10">
        <div className="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden">
          {event.cover_image_url ? (
            <img
              src={event.cover_image_url}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className={cn("h-full w-full bg-gradient-to-br", gradient)}
            />
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        </div>

        {/* Hero content overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-7 lg:px-10 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className="bg-[var(--color-accent)] text-white border-0">
                {eventTypeLabels[event.event_type] || event.event_type}
              </Badge>
              <Badge
                variant="outline"
                className="border-[var(--color-gold)]/50 text-[var(--color-gold)]"
              >
                {formatLabels[event.format] || event.format}
              </Badge>
              {event.theme && (
                <Badge variant="secondary" className="bg-surface-elevated">
                  {event.theme}
                </Badge>
              )}
              {event.is_featured && (
                <Badge className="bg-[var(--color-gold)] text-black border-0">
                  <Crown weight="fill" className="mr-1 h-3 w-3" />
                  Featured
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-2">
              {event.title}
            </h1>

            {/* Quick info row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <CalendarDots className="h-4 w-4" />
                {format(startsAt, "EEEE, MMMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock weight="light" className="h-4 w-4" />
                {format(startsAt, "h:mm a")} &ndash;{" "}
                {format(endsAt, "h:mm a")}
              </span>
              <span className="flex items-center gap-1.5">
                <Ticket weight="light" className="h-4 w-4 text-[var(--color-gold)]" />
                <span
                  className={
                    event.ticket_price_cents === 0
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-gold)]"
                  }
                >
                  {formatPrice(event.ticket_price_cents, event.currency)}
                </span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ───── Body ───── */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column — main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
              About This Event
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </div>
          </motion.section>

          <Separator className="bg-border" />

          {/* Details grid */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
              Event Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {event.dress_code && (
                <div className="flex items-start gap-3 rounded-lg bg-surface p-4 border border-border">
                  <TShirt weight="light" className="mt-0.5 h-5 w-5 text-[var(--color-accent)]" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Dress Code
                    </p>
                    <p className="text-sm text-foreground">
                      {event.dress_code}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 rounded-lg bg-surface p-4 border border-border">
                <Wine weight="light" className="mt-0.5 h-5 w-5 text-[var(--color-gold)]" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    BYOB
                  </p>
                  <p className="text-sm text-foreground">
                    {event.byob ? "Yes — bring your own" : "No"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-surface p-4 border border-border">
                <ForkKnife weight="light" className="mt-0.5 h-5 w-5 text-[var(--color-gold)]" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Catering
                  </p>
                  <p className="text-sm text-foreground">
                    {event.catering_included
                      ? "Food provided"
                      : "Not included"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-surface p-4 border border-border">
                <Shield weight="light" className="mt-0.5 h-5 w-5 text-[var(--color-accent)]" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Verification
                  </p>
                  <p className="text-sm text-foreground">
                    {event.requires_verification
                      ? "ID verification required"
                      : "Not required"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-surface p-4 border border-border">
                <UsersThree weight="light" className="mt-0.5 h-5 w-5 text-[var(--color-accent)]" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Minimum Age
                  </p>
                  <p className="text-sm text-foreground">{event.min_age}+</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-surface p-4 border border-border">
                <Globe weight="light" className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Timezone
                  </p>
                  <p className="text-sm text-foreground">{event.timezone}</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Venue (only for registered attendees) */}
          {isRegistered && isInPerson && (
            <>
              <Separator className="bg-border" />
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                  Venue
                </h2>
                <Card className="bg-surface border-border">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin weight="light" className="h-5 w-5 text-[var(--color-accent)]" />
                      <span className="font-medium text-foreground">
                        {event.venue_name || "Venue"}
                      </span>
                    </div>
                    {event.venue_address && (
                      <p className="text-sm text-muted-foreground pl-7">
                        {event.venue_address}
                      </p>
                    )}
                    {(event.venue_city || event.venue_province) && (
                      <p className="text-sm text-muted-foreground pl-7">
                        {[event.venue_city, event.venue_province]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                    {event.venue_instructions && (
                      <div className="mt-3 rounded-lg bg-[var(--color-gold-muted)] p-3 border border-[var(--color-gold)]/20">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Instructions
                        </p>
                        <p className="text-sm text-foreground">
                          {event.venue_instructions}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.section>
            </>
          )}

          {/* Virtual room link (only for registered attendees) */}
          {isRegistered && isVirtual && event.virtual_room_url && (
            <>
              <Separator className="bg-border" />
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                  Virtual Room
                </h2>
                <Card className="bg-surface border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Monitor weight="light" className="h-5 w-5 text-[var(--color-gold)]" />
                        <span className="text-sm text-foreground">
                          {event.virtual_platform || "Online"}
                        </span>
                      </div>
                      <a
                        href={event.virtual_room_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] transition-colors"
                      >
                        Join Room
                        <ArrowSquareOut weight="bold" className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            </>
          )}

          {/* Not registered notice for venue info */}
          {!isRegistered && isInPerson && (
            <>
              <Separator className="bg-border" />
              <div className="rounded-lg border border-border bg-surface p-4 text-center">
                <MapPin weight="duotone" className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Venue details will be revealed after registration
                </p>
              </div>
            </>
          )}

          <Separator className="bg-border" />

          {/* Rules & Consent */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <EventRulesDisplay
              rules={event.rules || []}
              consentRequirements={event.consent_requirements || []}
            />
          </motion.section>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Action card (RSVP, etc.) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="bg-surface border-border sticky top-24">
              <CardContent className="p-5 space-y-5">
                {/* Price */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Ticket Price
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      event.ticket_price_cents === 0
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-gold)]"
                    )}
                  >
                    {formatPrice(event.ticket_price_cents, event.currency)}
                  </p>
                </div>

                <Separator className="bg-border" />

                {/* Capacity */}
                <div>
                  <EventAttendees
                    count={event.current_attendees}
                    capacity={event.capacity}
                  />
                  {event.capacity && event.capacity > 0 && (
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          capacityPercent >= 90
                            ? "bg-[var(--color-danger)]"
                            : capacityPercent >= 70
                              ? "bg-[var(--color-warning)]"
                              : "bg-[var(--color-accent)]"
                        )}
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Action slot */}
                {actionSlot}

                {/* QR slot */}
                {qrSlot}
              </CardContent>
            </Card>
          </motion.div>

          {/* Host card */}
          {event.host && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-surface border-border">
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                    Hosted by
                  </p>
                  <Link
                    href={`/profile/${event.host.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar className="h-12 w-12 border-2 border-[var(--color-accent)]/30">
                      <AvatarImage src={event.host.avatar_url || ""} />
                      <AvatarFallback className="bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-semibold">
                        {(event.host.display_name || "H")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground group-hover:text-[var(--color-accent)] transition-colors">
                        {event.host.display_name || "Anonymous Host"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Event Organizer
                      </p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
