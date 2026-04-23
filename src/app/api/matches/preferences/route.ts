import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { matchPreferencesSchema } from "@/lib/utils/validators";

/* ─────────────────────────────────────────────
   GET /api/matches/preferences
   ───────────────────────────────────────────── */

const DEFAULT_PREFERENCES = {
  preferred_genders: [],
  min_age: 18,
  max_age: 99,
  preferred_experience_levels: [],
  max_distance_km: null,
  preferred_relationship_types: [],
  deal_breakers: [],
};

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await (supabase.from("match_preferences") as any)
      .select("*")
      .eq("profile_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Preferences fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch preferences" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      preferences: data || { profile_id: user.id, ...DEFAULT_PREFERENCES },
    });
  } catch (err) {
    console.error("Preferences GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ─────────────────────────────────────────────
   PUT /api/matches/preferences
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
    const parsed = matchPreferencesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase.from("match_preferences") as any)
      .upsert(
        {
          profile_id: user.id,
          ...parsed.data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "profile_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Preferences update error:", error);
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 }
      );
    }

    return NextResponse.json({ preferences: data });
  } catch (err) {
    console.error("Preferences PUT error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
