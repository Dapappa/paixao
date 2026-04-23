import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/verify-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const auth = await verifyAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { reportId } = await params;
    const admin = createAdminClient();

    const { data: report, error } = await (admin.from("reports") as any)
      .select(
        `*, reporter:profiles!reports_reporter_id_fkey(id, display_name, avatar_url, role, subscription_tier, is_verified, created_at), reported_user:profiles!reports_reported_user_id_fkey(id, display_name, avatar_url, role, subscription_tier, is_verified, is_banned, created_at)`
      )
      .eq("id", reportId)
      .single();

    if (error || !report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (err) {
    console.error("Admin report detail GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const auth = await verifyAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { reportId } = await params;
    const admin = createAdminClient();
    const body = await req.json();

    const updates: Record<string, unknown> = {};

    if (body.status) updates.status = body.status;
    if (body.resolution_action) updates.resolution_action = body.resolution_action;
    if (body.resolution_notes !== undefined) updates.resolution_notes = body.resolution_notes;

    if (body.status === "resolved" || body.status === "dismissed") {
      updates.resolved_by = auth.profile.id;
      updates.resolved_at = new Date().toISOString();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data, error } = await (admin.from("reports") as any)
      .update(updates)
      .eq("id", reportId)
      .select()
      .single();

    if (error) {
      console.error("Admin report update error:", error);
      return NextResponse.json(
        { error: "Failed to update report" },
        { status: 500 }
      );
    }

    // Audit log
    await (admin.from("audit_log") as any).insert({
      actor_id: auth.profile.id,
      action: "report_updated",
      target_type: "report",
      target_id: reportId,
      metadata: {
        changes: updates,
        admin_name: auth.profile.display_name,
      },
    });

    return NextResponse.json({ report: data });
  } catch (err) {
    console.error("Admin report update PUT error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
