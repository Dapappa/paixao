import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────
   GET /api/events/[eventId] — single event
   ───────────────────────────────────────────── */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = await createClient();

    const { data, error } = await (supabase.from("events") as any)
      .select(
        "*, host:profiles!events_host_id_fkey(id, display_name, avatar_url)"
      )
      .eq("id", eventId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ event: data });
  } catch (err) {
    console.error("Event GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ─────────────────────────────────────────────
   PUT /api/events/[eventId] — update event
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

    // Check ownership
    const { data: existing } = await (supabase.from("events") as any)
      .select("host_id")
      .eq("id", eventId)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (existing.host_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // Remove fields that shouldn't be updated directly
    const { id, host_id, created_at, current_attendees, ...updates } = body;

    const { data, error } = await (supabase.from("events") as any)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", eventId)
      .select()
      .single();

    if (error) {
      console.error("Event update error:", error);
      return NextResponse.json(
        { error: "Failed to update event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ event: data });
  } catch (err) {
    console.error("Event PUT error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ─────────────────────────────────────────────
   DELETE /api/events/[eventId] — archive event
   ───────────────────────────────────────────── */

export async function DELETE(
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

    const { data: existing } = await (supabase.from("events") as any)
      .select("host_id")
      .eq("id", eventId)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (existing.host_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete — set status to archived
    const { error } = await (supabase.from("events") as any)
      .update({
        status: "archived",
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId);

    if (error) {
      console.error("Event delete error:", error);
      return NextResponse.json(
        { error: "Failed to archive event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Event archived" });
  } catch (err) {
    console.error("Event DELETE error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
