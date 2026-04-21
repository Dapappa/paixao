"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EventDetailView } from "@/components/events/event-detail-view";
import { RSVPButton, type RSVPState } from "@/components/events/rsvp-button";
import { CheckInQR } from "@/components/events/check-in-qr";
import { toast } from "sonner";
import type { EventWithHost } from "@/lib/hooks/use-events";

interface EventRegistration {
  id: string;
  status: string;
  check_in_code: string;
  consent_acknowledged: boolean;
}

interface EventDetailClientProps {
  event: EventWithHost;
  registration: EventRegistration | null;
  userId: string | null;
}

function getInitialRSVPState(
  event: EventWithHost,
  registration: EventRegistration | null
): RSVPState {
  // Check if event has ended
  if (new Date(event.ends_at) < new Date()) return "past";

  if (registration) {
    switch (registration.status) {
      case "confirmed":
      case "checked_in":
        return "registered";
      case "waitlisted":
        return "waitlisted";
      case "cancelled":
        return "available";
      default:
        return "registered";
    }
  }

  // Check if at capacity
  if (event.capacity && event.current_attendees >= event.capacity) {
    return "sold_out";
  }

  return "available";
}

export function EventDetailClient({
  event,
  registration,
  userId,
}: EventDetailClientProps) {
  const router = useRouter();
  const [rsvpState, setRsvpState] = useState<RSVPState>(
    getInitialRSVPState(event, registration)
  );
  const [currentReg, setCurrentReg] = useState(registration);

  const isRegistered =
    currentReg?.status === "confirmed" ||
    currentReg?.status === "checked_in";

  const handleRegister = useCallback(async () => {
    // Navigate to the registration page with consent flow
    router.push(`/events/${event.id}/register`);
  }, [router, event.id]);

  const handleCancel = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${event.id}/register`, {
        method: "PUT",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to cancel registration");
      }

      setRsvpState("available");
      setCurrentReg(null);
      toast.success("Registration cancelled");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to cancel"
      );
    }
  }, [event.id, router]);

  return (
    <EventDetailView
      event={event}
      isRegistered={isRegistered}
      actionSlot={
        <RSVPButton
          state={rsvpState}
          onRegister={handleRegister}
          onCancel={handleCancel}
          disabled={!userId}
        />
      }
      qrSlot={
        isRegistered && currentReg?.check_in_code ? (
          <div className="mt-4">
            <CheckInQR
              eventTitle={event.title}
              eventDate={event.starts_at}
              checkInCode={currentReg.check_in_code}
            />
          </div>
        ) : null
      }
    />
  );
}
