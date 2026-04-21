"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Monitor,
  Users,
  Ticket,
} from "lucide-react";
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

const gradientsByType: Record<string, string> = {
  munch: "from-rose-900/60 via-pink-900/40 to-transparent",
  play_party: "from-purple-900/60 via-fuchsia-900/40 to-transparent",
  workshop: "from-amber-900/60 via-orange-900/40 to-transparent",
  social: "from-sky-900/60 via-blue-900/40 to-transparent",
  dungeon: "from-red-900/60 via-rose-900/40 to-transparent",
  retreat: "from-emerald-900/60 via-teal-900/40 to-transparent",
  conference: "from-indigo-900/60 via-violet-900/40 to-transparent",
  other: "from-gray-900/60 via-neutral-900/40 to-transparent",
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
   EventCard Component
   ───────────────────────────────────────────── */

interface EventCardProps {
  event: EventWithHost;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const startsAt = new Date(event.starts_at);
  const capacityPercent =
    event.capacity && event.capacity > 0
      ? Math.min((event.current_attendees / event.capacity) * 100, 100)
      : 0;
  const isVirtual =
    event.format === "virtual" || event.format === "hybrid";
  const gradient =
    gradientsByType[event.event_type] || gradientsByType.other;

  return (
    <Link href={`/events/${event.id}`} className="block">
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "group relative overflow-hidden rounded-xl border border-border bg-surface",
          "transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(194,24,91,0.15)]",
          className
        )}
      >
        {/* Cover image / gradient placeholder */}
        <div className="relative h-48 w-full overflow-hidden">
          {event.cover_image_url ? (
            <img
              src={event.cover_image_url}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className={cn(
                "h-full w-full bg-gradient-to-br",
                gradient
              )}
            />
          )}

          {/* Gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />

          {/* Event type badge */}
          <div className="absolute left-3 top-3">
            <Badge className="bg-[var(--color-accent)]/90 text-white border-0 backdrop-blur-sm text-xs">
              {eventTypeLabels[event.event_type] || event.event_type}
            </Badge>
          </div>

          {/* Format badge */}
          {isVirtual && (
            <div className="absolute right-3 top-3">
              <Badge
                variant="outline"
                className="border-[var(--color-gold)]/50 text-[var(--color-gold)] backdrop-blur-sm text-xs"
              >
                <Monitor className="mr-1 h-3 w-3" />
                {event.format === "hybrid" ? "Hybrid" : "Virtual"}
              </Badge>
            </div>
          )}

          {/* Date overlay */}
          <div className="absolute bottom-3 left-3">
            <div className="flex items-center gap-1.5 text-sm text-white/90">
              <Calendar className="h-3.5 w-3.5" />
              <span className="font-medium">
                {format(startsAt, "MMM d, yyyy")}
              </span>
              <span className="text-white/60">
                {format(startsAt, "h:mm a")}
              </span>
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-serif text-lg font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
            {event.title}
          </h3>

          {/* Short description */}
          {event.short_description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.short_description}
            </p>
          )}

          {/* Location */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {event.format === "virtual" ? (
              <>
                <Monitor className="h-3.5 w-3.5 text-[var(--color-gold)]" />
                <span>Virtual Event</span>
              </>
            ) : (
              <>
                <MapPin className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                <span className="truncate">
                  {[event.venue_city, event.venue_province]
                    .filter(Boolean)
                    .join(", ") || "Location TBA"}
                </span>
              </>
            )}
          </div>

          {/* Price + attendees row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <Ticket className="h-3.5 w-3.5 text-[var(--color-gold)]" />
              <span
                className={cn(
                  "text-sm font-semibold",
                  event.ticket_price_cents === 0
                    ? "text-[var(--color-success)]"
                    : "text-[var(--color-gold)]"
                )}
              >
                {formatPrice(event.ticket_price_cents, event.currency)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>
                {event.current_attendees}
                {event.capacity ? ` / ${event.capacity}` : ""}
              </span>
            </div>
          </div>

          {/* Capacity bar */}
          {event.capacity && event.capacity > 0 && (
            <div className="h-1 w-full overflow-hidden rounded-full bg-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${capacityPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  capacityPercent >= 90
                    ? "bg-[var(--color-danger)]"
                    : capacityPercent >= 70
                      ? "bg-[var(--color-warning)]"
                      : "bg-[var(--color-accent)]"
                )}
              />
            </div>
          )}

          {/* Host info */}
          {event.host && (
            <div className="flex items-center gap-2 pt-1 border-t border-border">
              <div className="h-6 w-6 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center overflow-hidden">
                {event.host.avatar_url ? (
                  <img
                    src={event.host.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-[var(--color-accent)]">
                    {(event.host.display_name || "H")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground truncate">
                Hosted by{" "}
                <span className="text-foreground font-medium">
                  {event.host.display_name || "Anonymous"}
                </span>
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
