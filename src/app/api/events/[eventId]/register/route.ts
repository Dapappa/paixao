import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

/* ─────────────────────────────────────────────
   POST /api/events/[eventId]/register
   ───────────────────────────────────────────── */

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Verify consent acknowledgment
    if (!body.consent_acknowledged) {
      return NextResponse.json(
        { error: "You must acknowledge all consent requirements" },
        { status: 400 }
      );
    }

    // Fetch the event
    const { data: event, error: eventError } = await (
      supabase.from("events") as any
    )
      .select("*")
      .eq("id", eventId)
      .eq("status", "published")
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: "Event not found or not available" },
        { status: 404 }
      );
    }

    // Check if already registered
    const { data: existingReg } = await (
      supabase.from("event_registrations") as any
    )
      .select("id, status")
      .eq("event_id", eventId)
      .eq("profile_id", user.id)
      .in("status", ["pending", "confirmed", "waitlisted"])
      .single();

    if (existingReg) {
      return NextResponse.json(
        { error: "You are already registered for this event" },
        { status: 409 }
      );
    }

    // Check capacity
    const atCapacity =
      event.capacity && event.current_attendees >= event.capacity;
    const status = atCapacity ? "waitlisted" : "confirmed";

    // Generate unique check-in code
    const checkInCode = randomUUID();

    // Create registration
    const regData = {
      event_id: eventId,
      profile_id: user.id,
      status,
      payment_status:
        event.ticket_price_cents > 0 ? "pending" : "not_required",
      check_in_code: checkInCode,
      consent_acknowledged: true,
      consent_acknowledged_at: new Date().toISOString(),
      notes: body.notes || null,
    };

    const { data: registration, error: regError } = await (
      supabase.from("event_registrations") as any
    )
      .insert(regData)
      .select()
      .single();

    if (regError) {
      console.error("Registration error:", regError);
      return NextResponse.json(
        { error: "Failed to register" },
        { status: 500 }
      );
    }

    // Increment attendee count (only if confirmed, not waitlisted)
    if (status === "confirmed") {
      await (supabase.from("events") as any)
        .update({ current_attendees: event.current_attendees + 1 })
        .eq("id", eventId);
    }

    // Record consent for each consent requirement
    if (event.consent_requirements && event.consent_requirements.length > 0) {
      const consentRecords = event.consent_requirements.map(
        (req: string, idx: number) => ({
          profile_id: user.id,
          consent_type: "event_consent_requirement",
          context_type: "event",
          context_id: eventId,
          details: { requirement: req, index: idx },
          granted_at: new Date().toISOString(),
        })
      );

      await (supabase.from("consent_records") as any).insert(consentRecords);
    }

    return NextResponse.json(
      {
        registration,
        checkInCode,
        status,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ─────────────────────────────────────────────
   PUT /api/events/[eventId]/register — cancel
   ───────────────────────────────────────────── */

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find active registration
    const { data: registration } = await (
      supabase.from("event_registrations") as any
    )
      .select("*")
      .eq("event_id", eventId)
      .eq("profile_id", user.id)
      .in("status", ["pending", "confirmed", "waitlisted"])
      .single();

    if (!registration) {
      return NextResponse.json(
        { error: "No active registration found" },
        { status: 404 }
      );
    }

    const wasConfirmed = registration.status === "confirmed";

    // Cancel registration
    const { error } = await (supabase.from("event_registrations") as any)
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", registration.id);

    if (error) {
      console.error("Cancel registration error:", error);
      return NextResponse.json(
        { error: "Failed to cancel registration" },
        { status: 500 }
      );
    }

    // Decrement attendee count if was confirmed
    if (wasConfirmed) {
      const { data: event } = await (supabase.from("events") as any)
        .select("current_attendees")
        .eq("id", eventId)
        .single();

      if (event) {
        await (supabase.from("events") as any)
          .update({
            current_attendees: Math.max(0, event.current_attendees - 1),
          })
          .eq("id", eventId);
      }
    }

    return NextResponse.json({ message: "Registration cancelled" });
  } catch (err) {
    console.error("Register PUT error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
