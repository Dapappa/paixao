import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────
   Default preferences
   ───────────────────────────────────────────── */

const DEFAULT_PREFERENCES = {
  email_new_match: true,
  email_new_message: false,
  email_event_reminder: true,
  email_event_update: true,
  email_system_announcement: true,
  push_new_match: true,
  push_new_message: true,
  push_event_reminder: true,
  push_event_update: true,
  push_system_announcement: true,
  in_app_all: true,
};

/* ─────────────────────────────────────────────
   GET /api/notifications/preferences
   ───────────────────────────────────────────── */

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await (supabase.from("notification_preferences") as any)
      .select("*")
      .eq("profile_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Preferences fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch preferences" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      preferences: data ?? { profile_id: user.id, ...DEFAULT_PREFERENCES },
    });
  } catch (err) {
    console.error("Preferences GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/* ─────────────────────────────────────────────
   PUT /api/notifications/preferences
   ───────────────────────────────────────────── */

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { data, error } = await (supabase.from("notification_preferences") as any)
      .upsert(
        {
          profile_id: user.id,
          ...body,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "profile_id" },
      )
      .select()
      .single();

    if (error) {
      console.error("Preferences upsert error:", error);
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 },
      );
    }

    return NextResponse.json({ preferences: data });
  } catch (err) {
    console.error("Preferences PUT error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
