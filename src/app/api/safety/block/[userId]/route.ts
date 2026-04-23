import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────
   GET /api/safety/block/[userId] — list blocked users
   ───────────────────────────────────────────── */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all blocked users for the auth user
    const { data: blocks, error: fetchError } = await (
      supabase.from("blocks") as any
    )
      .select(
        `
        id,
        blocked_id,
        reason,
        created_at,
        blocked:profiles!blocks_blocked_id_fkey (
          id,
          display_name,
          avatar_url
        )
      `
      )
      .eq("blocker_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Blocked users fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch blocked users" },
        { status: 500 }
      );
    }

    return NextResponse.json({ blocked: blocks || [] });
  } catch (err) {
    console.error("Blocked users GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ─────────────────────────────────────────────
   DELETE /api/safety/block/[userId] — unblock a user
   ───────────────────────────────────────────── */

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    const { error: deleteError } = await (supabase.from("blocks") as any)
      .delete()
      .eq("blocker_id", user.id)
      .eq("blocked_id", userId);

    if (deleteError) {
      console.error("Unblock error:", deleteError);
      return NextResponse.json(
        { error: "Failed to unblock user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unblock DELETE error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
