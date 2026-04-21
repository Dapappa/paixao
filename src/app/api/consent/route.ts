import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────
   POST /api/consent — record a consent action
   ───────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { consent_type, context_type, context_id, details } = body;

    if (!consent_type || !context_type || !context_id) {
      return NextResponse.json(
        { error: "Missing required fields: consent_type, context_type, context_id" },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase.from("consent_records") as any)
      .insert({
        profile_id: user.id,
        consent_type,
        context_type,
        context_id,
        details: details || null,
        granted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Consent record error:", error);
      return NextResponse.json(
        { error: "Failed to record consent" },
        { status: 500 }
      );
    }

    return NextResponse.json({ consent: data }, { status: 201 });
  } catch (err) {
    console.error("Consent POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
