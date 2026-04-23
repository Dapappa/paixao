import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────
   GET /api/notifications — list user's notifications
   ───────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 20));
    const type = url.searchParams.get("type");

    // Build query
    let query = (supabase.from("notifications") as any)
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    // Cursor-based pagination
    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    // Optional type filter
    if (type && type !== "all") {
      const typeMap: Record<string, string[]> = {
        matches: ["new_match", "match_suggestion"],
        messages: ["new_message"],
        events: ["event_reminder", "event_update", "registration_confirmed"],
        system: [
          "report_update",
          "consent_request",
          "system_announcement",
          "verification_approved",
          "verification_rejected",
          "host_application_update",
          "subscription_expiring",
        ],
      };
      const types = typeMap[type];
      if (types) {
        query = query.in("type", types);
      }
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error("Notifications fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 },
      );
    }

    // Get unread count
    const { count: unreadCount } = await (supabase.from("notifications") as any)
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .eq("is_read", false);

    // Determine next cursor
    const nextCursor =
      notifications && notifications.length === limit
        ? notifications[notifications.length - 1].created_at
        : null;

    return NextResponse.json({
      notifications: notifications ?? [],
      unread_count: unreadCount ?? 0,
      next_cursor: nextCursor,
    });
  } catch (err) {
    console.error("Notifications GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
