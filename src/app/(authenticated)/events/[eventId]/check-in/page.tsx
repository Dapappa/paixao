"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckInQR } from "@/components/events/check-in-qr";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDots,
  MapPin,
  Monitor,
  Info,
  Warning,
} from "@phosphor-icons/react/ssr";
import { format } from "date-fns";
import type { EventWithHost } from "@/lib/hooks/use-events";

interface RegistrationData {
  id: string;
  status: string;
  check_in_code: string;
  checked_in_at: string | null;
}

export default function CheckInPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventWithHost | null>(null);
  const [registration, setRegistration] = useState<RegistrationData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch event
        const eventRes = await fetch(`/api/events/${eventId}`);
        if (!eventRes.ok) throw new Error("Event not found");
        const eventData = await eventRes.json();
        setEvent(eventData.event);

        // Fetch registration via the event detail page data
        // We use supabase client-side for this
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("You must be logged in");
          return;
        }

        const { data: reg } = await (
          supabase.from("event_registrations") as any
        )
          .select("id, status, check_in_code, checked_in_at")
          .eq("event_id", eventId)
          .eq("profile_id", user.id)
          .in("status", [
            "pending",
            "confirmed",
            "waitlisted",
            "checked_in",
          ])
          .single();

        if (!reg) {
          setError("You are not registered for this event");
          return;
        }

        setRegistration(reg);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load check-in data"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center space-y-4">
        <Warning weight="duotone" className="mx-auto h-12 w-12 text-[var(--color-danger)]" />
        <h2 className="text-lg font-semibold text-foreground">{error}</h2>
        <Button
          variant="outline"
          onClick={() => router.push(`/events/${eventId}`)}
          className="border-border"
        >
          <ArrowLeft weight="bold" className="mr-1 h-4 w-4" />
          Back to Event
        </Button>
      </div>
    );
  }

  if (!event || !registration) return null;

  const isCheckedIn = registration.status === "checked_in";
  const isWaitlisted = registration.status === "waitlisted";

  return (
    <div className="mx-auto max-w-lg py-8 space-y-6">
      {/* Back */}
      <Button
        variant="ghost"
        onClick={() => router.push(`/events/${eventId}`)}
        className="text-muted-foreground -ml-2"
      >
        <ArrowLeft weight="bold" className="mr-1 h-4 w-4" />
        Back to event
      </Button>

      {/* Status banner */}
      {isCheckedIn && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 p-4 text-center"
        >
          <p className="text-sm font-medium text-[var(--color-success)]">
            You have been checked in
          </p>
          {registration.checked_in_at && (
            <p className="text-xs text-muted-foreground mt-1">
              Checked in at{" "}
              {format(
                new Date(registration.checked_in_at),
                "h:mm a 'on' MMM d"
              )}
            </p>
          )}
        </motion.div>
      )}

      {isWaitlisted && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 p-4 text-center"
        >
          <p className="text-sm font-medium text-[var(--color-warning)]">
            You are on the waitlist
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            We'll notify you if a spot opens up
          </p>
        </motion.div>
      )}

      {/* Event info card */}
      <Card className="bg-surface border-border">
        <CardContent className="p-4 space-y-3">
          <h2 className="font-serif text-xl font-bold text-foreground">
            {event.title}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDots className="h-3.5 w-3.5" />
              {format(new Date(event.starts_at), "EEEE, MMMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1">
              {format(new Date(event.starts_at), "h:mm a")} &ndash;{" "}
              {format(new Date(event.ends_at), "h:mm a")}
            </span>
          </div>

          {/* Venue / Virtual info */}
          {(event.format === "in_person" || event.format === "hybrid") &&
            event.venue_name && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin weight="light" className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                <div>
                  <p className="text-foreground font-medium">
                    {event.venue_name}
                  </p>
                  {event.venue_address && (
                    <p className="text-muted-foreground">
                      {event.venue_address}
                    </p>
                  )}
                  {(event.venue_city || event.venue_province) && (
                    <p className="text-muted-foreground">
                      {[event.venue_city, event.venue_province]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </div>
              </div>
            )}

          {(event.format === "virtual" || event.format === "hybrid") && (
            <div className="flex items-center gap-2 text-sm">
              <Monitor weight="light" className="h-4 w-4 text-[var(--color-gold)]" />
              <span className="text-foreground">
                {event.virtual_platform || "Virtual Event"}
              </span>
            </div>
          )}

          {event.venue_instructions && (
            <div className="rounded-lg bg-[var(--color-gold-muted)] p-3 border border-[var(--color-gold)]/20">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Arrival Instructions
              </p>
              <p className="text-sm text-foreground">
                {event.venue_instructions}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code */}
      {!isWaitlisted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <CheckInQR
            eventTitle={event.title}
            eventDate={event.starts_at}
            checkInCode={registration.check_in_code}
          />
        </motion.div>
      )}

      {/* Instruction */}
      {!isCheckedIn && !isWaitlisted && (
        <div className="flex items-start gap-3 rounded-lg bg-surface p-4 border border-border">
          <Info weight="duotone" className="mt-0.5 h-5 w-5 text-[var(--color-gold)]" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Show this to the host at check-in
            </p>
            <p className="text-xs text-muted-foreground">
              The host will scan or verify your QR code when you arrive. Keep
              this page accessible on your phone.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
