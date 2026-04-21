import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────
   GET /api/consent/verify — check consent exists
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
    const consentType = url.searchParams.get("consent_type");
    const contextType = url.searchParams.get("context_type");
    const contextId = url.searchParams.get("context_id");

    if (!consentType || !contextType || !contextId) {
      return NextResponse.json(
        { error: "Missing query params: consent_type, context_type, context_id" },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase.from("consent_records") as any)
      .select("id")
      .eq("profile_id", user.id)
      .eq("consent_type", consentType)
      .eq("context_type", contextType)
      .eq("context_id", contextId)
      .limit(1);

    if (error) {
      console.error("Consent verify error:", error);
      return NextResponse.json(
        { error: "Failed to verify consent" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      exists: data && data.length > 0,
    });
  } catch (err) {
    console.error("Consent verify error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
