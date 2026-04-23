import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/verify-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const admin = createAdminClient();
    const url = new URL(req.url);

    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const perPage = Math.min(50, Math.max(1, Number(url.searchParams.get("per_page")) || 20));
    const status = url.searchParams.get("status");

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = (admin.from("host_applications") as any)
      .select(
        `*, applicant:profiles!host_applications_applicant_id_fkey(id, display_name, avatar_url, role, subscription_tier, is_verified)`,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Admin hosts fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch host applications" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      applications: data || [],
      totalCount: count || 0,
      page,
      perPage,
    });
  } catch (err) {
    console.error("Admin hosts GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const admin = createAdminClient();
    const body = await req.json();

    const { applicationId, action, notes } = body as {
      applicationId: string;
      action: "approve" | "reject";
      notes?: string;
    };

    if (!applicationId || !action) {
      return NextResponse.json(
        { error: "applicationId and action are required" },
        { status: 400 }
      );
    }

    // Update application status
    const updates: Record<string, unknown> = {
      status: action === "approve" ? "approved" : "rejected",
      reviewed_by: auth.profile.id,
      reviewed_at: new Date().toISOString(),
    };

    if (notes) {
      updates.review_notes = notes;
    }

    const { data: app, error: appError } = await (admin.from("host_applications") as any)
      .update(updates)
      .eq("id", applicationId)
      .select("*, applicant:profiles!host_applications_applicant_id_fkey(id, display_name)")
      .single();

    if (appError) {
      console.error("Admin host application update error:", appError);
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: 500 }
      );
    }

    // If approved, update the user's role to 'host'
    if (action === "approve" && app.applicant_id) {
      await (admin.from("profiles") as any)
        .update({ role: "host" })
        .eq("id", app.applicant_id);
    }

    // Audit log
    await (admin.from("audit_log") as any).insert({
      actor_id: auth.profile.id,
      action: `host_application_${action}`,
      target_type: "host_application",
      target_id: applicationId,
      metadata: {
        applicant_id: app.applicant_id,
        notes,
        admin_name: auth.profile.display_name,
      },
    });

    return NextResponse.json({ application: app });
  } catch (err) {
    console.error("Admin hosts PUT error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
