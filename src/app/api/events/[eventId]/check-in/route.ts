import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────
   POST /api/events/[eventId]/check-in
   Host checks in an attendee by check_in_code
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

    // Verify the current user is the event host
    const { data: event } = await (supabase.from("events") as any)
      .select("host_id")
      .eq("id", eventId)
      .single();

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.host_id !== user.id) {
      return NextResponse.json(
        { error: "Only the host can check in attendees" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { check_in_code } = body;

    if (!check_in_code) {
      return NextResponse.json(
        { error: "Check-in code is required" },
        { status: 400 }
      );
    }

    // Find the registration
    const { data: registration } = await (
      supabase.from("event_registrations") as any
    )
      .select("*")
      .eq("event_id", eventId)
      .eq("check_in_code", check_in_code)
      .single();

    if (!registration) {
      return NextResponse.json(
        { error: "Invalid check-in code" },
        { status: 404 }
      );
    }

    if (registration.status === "checked_in") {
      return NextResponse.json(
        { error: "Attendee already checked in", checked_in_at: registration.checked_in_at },
        { status: 409 }
      );
    }

    if (registration.status === "cancelled") {
      return NextResponse.json(
        { error: "Registration was cancelled" },
        { status: 400 }
      );
    }

    // Update registration
    const { data: updated, error } = await (
      supabase.from("event_registrations") as any
    )
      .update({
        status: "checked_in",
        checked_in_at: new Date().toISOString(),
        checked_in_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", registration.id)
      .select()
      .single();

    if (error) {
      console.error("Check-in error:", error);
      return NextResponse.json(
        { error: "Failed to check in attendee" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Attendee checked in successfully",
      registration: updated,
    });
  } catch (err) {
    console.error("Check-in POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
