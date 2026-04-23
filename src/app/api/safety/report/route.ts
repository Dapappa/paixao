import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reportSchema } from "@/lib/utils/validators";

/* ─────────────────────────────────────────────
   Severity auto-assignment based on category
   ───────────────────────────────────────────── */

function autoSeverity(
  category: string
): "low" | "medium" | "high" | "critical" {
  switch (category) {
    case "underage_suspicion":
    case "consent_violation":
      return "critical";
    case "harassment":
    case "unsafe_behavior":
      return "high";
    case "inappropriate_content":
    case "discrimination":
      return "medium";
    default:
      return "low";
  }
}

/* ─────────────────────────────────────────────
   POST /api/safety/report — submit a report
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
    const parsed = reportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { category, description, evidence_urls, reported_user_id, reported_event_id, reported_message_id } = parsed.data;

    const severity = autoSeverity(category);

    const { data: report, error: insertError } = await (
      supabase.from("reports") as any
    )
      .insert({
        reporter_id: user.id,
        reported_user_id: reported_user_id || null,
        reported_event_id: reported_event_id || null,
        reported_message_id: reported_message_id || null,
        category,
        severity,
        description,
        evidence_urls: evidence_urls || [],
        status: "pending",
      })
      .select("id, status, severity, created_at")
      .single();

    if (insertError) {
      console.error("Report insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to submit report" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: report.id,
      status: report.status,
      severity: report.severity,
      created_at: report.created_at,
    });
  } catch (err) {
    console.error("Report POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
