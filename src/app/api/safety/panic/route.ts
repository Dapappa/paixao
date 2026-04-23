import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────
   POST /api/safety/panic — emergency panic alert
   ───────────────────────────────────────────── */

export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create a critical report automatically
    const { data: report, error: insertError } = await (
      supabase.from("reports") as any
    )
      .insert({
        reporter_id: user.id,
        category: "unsafe_behavior",
        severity: "critical",
        description: "Emergency panic alert triggered",
        evidence_urls: [],
        status: "pending",
      })
      .select("id, status, created_at")
      .single();

    if (insertError) {
      console.error("Panic report error:", insertError);
      return NextResponse.json(
        { error: "Failed to submit panic alert" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      report_id: report.id,
      message: "Emergency alert submitted. Our team has been notified.",
    });
  } catch (err) {
    console.error("Panic POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
