"use client";

import Image from "next/image";
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
    <>
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
        <div className="absolute right-[-4%] top-[10%] h-[420px] w-[540px] rounded-full bg-accent/[0.06] blur-[130px] animate-breath" />
      </div>

      <div className="relative z-10">
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
      </div>

      {/* ── Atmosphere overlays ── */}
      <div className="vignette" aria-hidden />
      <div className="film-grain" aria-hidden />
    </>
  );
}
