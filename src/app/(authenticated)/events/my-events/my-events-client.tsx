"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Monitor,
  Plus,
  QrCode,
  Edit,
  Eye,
  Users,
  Ticket,
  CalendarDays,
} from "lucide-react";
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

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */

export function MyEventsClient({
  registrations,
  hostedEvents,
}: MyEventsClientProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            My Events
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your registrations and hosted events
          </p>
        </div>
        <Button
          onClick={() => router.push("/events/create")}
          className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
        >
          <Plus className="mr-1 h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="attending" className="w-full">
        <TabsList className="w-full sm:w-auto bg-surface border border-border">
          <TabsTrigger value="attending" className="flex-1 sm:flex-none">
            <Ticket className="mr-1.5 h-4 w-4" />
            Attending ({registrations.length})
          </TabsTrigger>
          <TabsTrigger value="hosting" className="flex-1 sm:flex-none">
            <CalendarDays className="mr-1.5 h-4 w-4" />
            Hosting ({hostedEvents.length})
          </TabsTrigger>
        </TabsList>

        {/* Attending tab */}
        <TabsContent value="attending" className="space-y-4 mt-4">
          {registrations.length === 0 ? (
            <EmptyState
              icon={Ticket}
              title="No events yet"
              description="You haven't registered for any events yet. Browse upcoming events to find something that interests you."
              action={{
                label: "Browse Events",
                onClick: () => router.push("/events"),
              }}
            />
          ) : (
            registrations.map((reg, idx) => (
              <motion.div
                key={reg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={`/events/${reg.event.id}`}>
                  <Card className="bg-surface border-border hover:border-[var(--color-accent)]/30 transition-colors group">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Mini cover */}
                        <div className="hidden sm:block h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--color-accent-muted)]">
                          {reg.event.cover_image_url ? (
                            <img
                              src={reg.event.cover_image_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-[var(--color-accent)]/30 to-transparent" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-serif text-base font-semibold text-foreground leading-tight truncate group-hover:text-[var(--color-accent)] transition-colors">
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

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(
                                new Date(reg.event.starts_at),
                                "MMM d, yyyy 'at' h:mm a"
                              )}
                            </span>
                            {reg.event.format === "virtual" ? (
                              <span className="flex items-center gap-1">
                                <Monitor className="h-3 w-3" />
                                Virtual
                              </span>
                            ) : (
                              reg.event.venue_city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {reg.event.venue_city}
                                </span>
                              )
                            )}
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {eventTypeLabels[reg.event.event_type] ||
                                reg.event.event_type}
                            </Badge>
                          </div>

                          {/* Actions */}
                          {(reg.status === "confirmed" ||
                            reg.status === "pending") && (
                            <div className="pt-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
                                onClick={(e) => {
                                  e.preventDefault();
                                  router.push(
                                    `/events/${reg.event.id}/check-in`
                                  );
                                }}
                              >
                                <QrCode className="mr-1 h-3 w-3" />
                                Check-in Pass
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </TabsContent>

        {/* Hosting tab */}
        <TabsContent value="hosting" className="space-y-4 mt-4">
          {hostedEvents.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No hosted events"
              description="You haven't created any events yet. Start hosting to bring the community together."
              action={{
                label: "Create Event",
                onClick: () => router.push("/events/create"),
              }}
            />
          ) : (
            hostedEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-surface border-border hover:border-[var(--color-gold)]/30 transition-colors group">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Mini cover */}
                      <div className="hidden sm:block h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--color-gold-muted)]">
                        {event.cover_image_url ? (
                          <img
                            src={event.cover_image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-[var(--color-gold)]/30 to-transparent" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-serif text-base font-semibold text-foreground leading-tight truncate">
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

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(
                              new Date(event.starts_at),
                              "MMM d, yyyy"
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.current_attendees}
                            {event.capacity
                              ? ` / ${event.capacity}`
                              : ""}{" "}
                            attendees
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {eventTypeLabels[event.event_type] ||
                              event.event_type}
                          </Badge>
                        </div>

                        {/* Host actions */}
                        <div className="flex items-center gap-2 pt-1">
                          <Link href={`/events/${event.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                          </Link>
                          {event.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-[var(--color-gold)] hover:text-[var(--color-gold)]"
                              onClick={async () => {
                                // Quick publish
                                try {
                                  const res = await fetch(
                                    `/api/events/${event.id}`,
                                    {
                                      method: "PUT",
                                      headers: {
                                        "Content-Type": "application/json",
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
                              <Edit className="mr-1 h-3 w-3" />
                              Publish
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
