import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeWordSchema } from "@/lib/utils/validators";

/* ─────────────────────────────────────────────
   GET /api/safety/safe-word — fetch safe words
   ───────────────────────────────────────────── */

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: safeWords, error: fetchError } = await (
      supabase.from("safe_words") as any
    )
      .select(
        "id, safe_word_hash, emergency_contact_name, emergency_contact_method, emergency_contact_value, action_on_trigger, is_active, created_at"
      )
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Safe words fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch safe words" },
        { status: 500 }
      );
    }

    return NextResponse.json({ safe_words: safeWords || [] });
  } catch (err) {
    console.error("Safe words GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ─────────────────────────────────────────────
   PUT /api/safety/safe-word — upsert safe word
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
    const parsed = safeWordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      safe_word,
      action_on_trigger,
      emergency_contact_name,
      emergency_contact_method,
      emergency_contact_value,
    } = parsed.data;

    // Upsert: use profile_id as the conflict key
    const { data: record, error: upsertError } = await (
      supabase.from("safe_words") as any
    )
      .upsert(
        {
          profile_id: user.id,
          safe_word_hash: safe_word,
          action_on_trigger,
          emergency_contact_name: emergency_contact_name || null,
          emergency_contact_method: emergency_contact_method || null,
          emergency_contact_value: emergency_contact_value || null,
          is_active: true,
        },
        { onConflict: "profile_id" }
      )
      .select("id, action_on_trigger, is_active, created_at")
      .single();

    if (upsertError) {
      console.error("Safe word upsert error:", upsertError);
      return NextResponse.json(
        { error: "Failed to save safe word" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, safe_word: record });
  } catch (err) {
    console.error("Safe word PUT error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
