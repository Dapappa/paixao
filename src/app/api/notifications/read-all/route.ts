import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────
   PUT /api/notifications/read-all — mark all notifications as read
   ───────────────────────────────────────────── */

export async function PUT() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await (supabase.from("notifications") as any)
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("profile_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Mark all read error:", error);
      return NextResponse.json(
        { error: "Failed to mark all as read" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Read-all PUT error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
