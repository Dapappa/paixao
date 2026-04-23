import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────
   PUT /api/messages/[conversationId]/read — mark messages as read
   ───────────────────────────────────────────── */

export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const { conversationId } = await params;
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify participant
    const { data: conv, error: convError } = await (
      supabase.from("conversations") as any
    )
      .select("id, participant_a, participant_b")
      .eq("id", conversationId)
      .single();

    if (convError || !conv) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    if (conv.participant_a !== user.id && conv.participant_b !== user.id) {
      return NextResponse.json(
        { error: "Not a participant" },
        { status: 403 },
      );
    }

    // Mark all unread messages from the OTHER user as read
    const { error: updateError, count } = await (
      supabase.from("messages") as any
    )
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .is("read_at", null);

    if (updateError) {
      console.error("Mark read error:", updateError);
      return NextResponse.json(
        { error: "Failed to mark messages as read" },
        { status: 500 },
      );
    }

    return NextResponse.json({ updated: count ?? 0 });
  } catch (err) {
    console.error("Messages read PUT error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
