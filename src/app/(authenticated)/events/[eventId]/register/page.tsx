"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckInQR } from "@/components/events/check-in-qr";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  CheckCircle,
  Calendar,
  MapPin,
  Monitor,
  Loader2,
  ArrowLeft,
  PartyPopper,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { EventWithHost } from "@/lib/hooks/use-events";

type PageState = "loading" | "consent" | "success" | "error";

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const [pageState, setPageState] = useState<PageState>("loading");
  const [event, setEvent] = useState<EventWithHost | null>(null);
  const [consentChecked, setConsentChecked] = useState<boolean[]>([]);
  const [masterConsent, setMasterConsent] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkInCode, setCheckInCode] = useState<string | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch event data
  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (!res.ok) throw new Error("Event not found");
        const data = await res.json();
        setEvent(data.event);
        setConsentChecked(
          new Array(data.event.consent_requirements?.length || 0).fill(false)
        );
        setPageState("consent");
      } catch {
        setErrorMessage("Could not load event details");
        setPageState("error");
      }
    }
    fetchEvent();
  }, [eventId]);

  const allConsentsChecked =
    consentChecked.length === 0 ||
    consentChecked.every((c) => c === true);
  const canSubmit = allConsentsChecked && masterConsent;

  const handleConsentToggle = (index: number) => {
    setConsentChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consent_acknowledged: true,
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Registration failed");
      }

      const data = await res.json();
      setCheckInCode(data.checkInCode);
      setRegistrationStatus(data.status);
      setPageState("success");
      toast.success(
        data.status === "waitlisted"
          ? "You have been added to the waitlist"
          : "Successfully registered!"
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Registration failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Loading ─── */
  if (pageState === "loading") {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  /* ─── Error ─── */
  if (pageState === "error") {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-[var(--color-danger)]" />
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
        <Button
          variant="outline"
          onClick={() => router.push("/events")}
          className="border-border"
        >
          Back to Events
        </Button>
      </div>
    );
  }

  /* ─── Success ─── */
  if (pageState === "success" && event) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-lg py-8 space-y-6"
      >
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success)]/20">
              {registrationStatus === "waitlisted" ? (
                <AlertTriangle className="h-8 w-8 text-[var(--color-warning)]" />
              ) : (
                <PartyPopper className="h-8 w-8 text-[var(--color-success)]" />
              )}
            </div>
          </motion.div>

          <h2 className="font-serif text-2xl font-bold text-foreground">
            {registrationStatus === "waitlisted"
              ? "You're on the Waitlist"
              : "You're Registered!"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {registrationStatus === "waitlisted"
              ? "We'll notify you if a spot opens up."
              : "Your spot is confirmed. Save your check-in code."}
          </p>
        </div>

        {/* QR Code */}
        {checkInCode && registrationStatus !== "waitlisted" && (
          <CheckInQR
            eventTitle={event.title}
            eventDate={event.starts_at}
            checkInCode={checkInCode}
          />
        )}

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => router.push(`/events/${eventId}/check-in`)}
            className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
          >
            View Check-in Pass
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/events/${eventId}`)}
            className="border-border"
          >
            Back to Event
          </Button>
        </div>
      </motion.div>
    );
  }

  /* ─── Consent flow ─── */
  if (!event) return null;

  return (
    <div className="mx-auto max-w-lg py-8 space-y-6">
      {/* Back */}
      <Button
        variant="ghost"
        onClick={() => router.push(`/events/${eventId}`)}
        className="text-muted-foreground -ml-2"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to event
      </Button>

      {/* Event summary card */}
      <Card className="bg-surface border-border">
        <CardContent className="p-4 space-y-2">
          <h2 className="font-serif text-xl font-bold text-foreground">
            {event.title}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(event.starts_at), "MMM d, yyyy 'at' h:mm a")}
            </span>
            {event.format === "virtual" ? (
              <span className="flex items-center gap-1">
                <Monitor className="h-3.5 w-3.5" />
                Virtual
              </span>
            ) : (
              event.venue_city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.venue_city}
                </span>
              )
            )}
          </div>
          {event.capacity && (
            <p className="text-xs text-muted-foreground">
              {event.current_attendees} / {event.capacity} spots filled
            </p>
          )}
        </CardContent>
      </Card>

      {/* Consent section */}
      <Card className="bg-surface border-border overflow-hidden">
        <div className="bg-gradient-to-r from-[var(--color-accent)]/20 to-transparent px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[var(--color-accent)]" />
            <h3 className="font-serif text-lg font-semibold text-foreground">
              Consent & Acknowledgment
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Please read and acknowledge each requirement before registering.
            This is a consent-first community.
          </p>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Individual consent requirements */}
          {event.consent_requirements &&
            event.consent_requirements.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Event Consent Requirements
                </p>
                {event.consent_requirements.map(
                  (req: string, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        "flex items-start gap-3 rounded-lg p-3 border transition-colors",
                        consentChecked[idx]
                          ? "bg-[var(--color-success)]/5 border-[var(--color-success)]/30"
                          : "bg-surface-elevated border-border"
                      )}
                    >
                      <Checkbox
                        checked={consentChecked[idx]}
                        onCheckedChange={() => handleConsentToggle(idx)}
                        className="mt-0.5"
                      />
                      <label
                        className="text-sm text-foreground leading-relaxed cursor-pointer flex-1"
                        onClick={() => handleConsentToggle(idx)}
                      >
                        {req}
                      </label>
                      {consentChecked[idx] && (
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                      )}
                    </motion.div>
                  )
                )}
              </div>
            )}

          {/* Event rules display */}
          {event.rules && event.rules.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Event Rules
              </p>
              <div className="rounded-lg bg-surface-elevated p-3 border border-border space-y-2">
                {event.rules.map((rule: string, idx: number) => (
                  <div key={idx} className="flex gap-2 text-sm">
                    <span className="text-muted-foreground shrink-0">
                      {idx + 1}.
                    </span>
                    <span className="text-foreground">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator className="bg-border" />

          {/* Master consent checkbox */}
          <div
            className={cn(
              "flex items-start gap-3 rounded-lg p-4 border-2 transition-colors",
              masterConsent
                ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                : "border-border bg-surface-elevated"
            )}
          >
            <Checkbox
              checked={masterConsent}
              onCheckedChange={(v) => setMasterConsent(v === true)}
              className="mt-0.5"
            />
            <label
              className="text-sm font-medium text-foreground leading-relaxed cursor-pointer"
              onClick={() => setMasterConsent(!masterConsent)}
            >
              I acknowledge and agree to all event rules and consent
              requirements listed above. I understand that violation of these
              rules may result in removal from the event and community
              action.
            </label>
          </div>

          {/* Optional notes */}
          <div>
            <Label className="text-foreground text-sm">
              Notes for the host{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any dietary restrictions, accessibility needs, or other notes..."
              className="mt-1.5 bg-background border-border"
              maxLength={500}
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className={cn(
              "w-full text-base font-semibold transition-all",
              canSubmit
                ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-[0_0_20px_rgba(194,24,91,0.2)]"
                : "bg-surface text-muted-foreground"
            )}
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Confirm Registration"
            )}
          </Button>

          {!canSubmit && (
            <p className="text-center text-xs text-muted-foreground">
              You must acknowledge all consent requirements and event rules
              to register.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
