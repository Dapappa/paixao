import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/verify-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await verifyAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { userId } = await params;
    const admin = createAdminClient();

    // Fetch profile
    const { data: profile, error: profileErr } = await (admin.from("profiles") as any)
      .select("*")
      .eq("id", userId)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch related data in parallel
    const [photosRes, interestsRes, matchCountRes, reportsAsReporterRes, reportsAsReportedRes, paymentsRes] =
      await Promise.all([
        (admin.from("profile_photos") as any)
          .select("*")
          .eq("profile_id", userId)
          .order("order", { ascending: true }),
        (admin.from("profile_interests") as any)
          .select("interest_id, level, interests!profile_interests_interest_id_fkey(id, name, category, emoji)")
          .eq("profile_id", userId),
        (admin.from("matches") as any)
          .select("id", { count: "exact", head: true })
          .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`),
        (admin.from("reports") as any)
          .select("id, category, severity, status, created_at")
          .eq("reporter_id", userId)
          .order("created_at", { ascending: false })
          .limit(20),
        (admin.from("reports") as any)
          .select("id, category, severity, status, created_at")
          .eq("reported_user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20),
        (admin.from("payments") as any)
          .select("id, amount_cents, currency, status, description, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

    return NextResponse.json({
      profile,
      photos: photosRes.data || [],
      interests: interestsRes.data || [],
      matchCount: matchCountRes.count || 0,
      reportsAsReporter: reportsAsReporterRes.data || [],
      reportsAsReported: reportsAsReportedRes.data || [],
      payments: paymentsRes.data || [],
    });
  } catch (err) {
    console.error("Admin user detail GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await verifyAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { userId } = await params;
    const admin = createAdminClient();
    const body = await req.json();

    const allowedFields = [
      "role",
      "is_banned",
      "ban_reason",
      "is_verified",
      "subscription_tier",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    // If banning, set banned_at
    if (updates.is_banned === true) {
      updates.banned_at = new Date().toISOString();
    } else if (updates.is_banned === false) {
      updates.banned_at = null;
      updates.ban_reason = null;
    }

    const { data, error } = await (admin.from("profiles") as any)
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Admin user update error:", error);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    // Insert audit log entry
    await (admin.from("audit_log") as any).insert({
      actor_id: auth.profile.id,
      action: "user_updated",
      target_type: "profile",
      target_id: userId,
      metadata: {
        changes: updates,
        admin_name: auth.profile.display_name,
      },
    });

    return NextResponse.json({ profile: data });
  } catch (err) {
    console.error("Admin user update PUT error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
