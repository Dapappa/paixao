import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/verify-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const auth = await verifyAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const admin = createAdminClient();

    // Run all counts in parallel
    const [
      totalUsersRes,
      activeUsersRes,
      pendingReportsRes,
      pendingVerificationsRes,
      pendingHostAppsRes,
      upcomingEventsRes,
      monthlyRevenueRes,
    ] = await Promise.all([
      // Total users
      (admin.from("profiles") as any)
        .select("id", { count: "exact", head: true }),

      // Active users (last 7 days)
      (admin.from("profiles") as any)
        .select("id", { count: "exact", head: true })
        .gte("last_active_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),

      // Pending reports
      (admin.from("reports") as any)
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),

      // Pending verifications
      (admin.from("verification_submissions") as any)
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),

      // Pending host applications
      (admin.from("host_applications") as any)
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),

      // Upcoming events
      (admin.from("events") as any)
        .select("id", { count: "exact", head: true })
        .gte("starts_at", new Date().toISOString()),

      // Monthly revenue
      (() => {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        return (admin.from("payments") as any)
          .select("amount_cents")
          .gte("created_at", startOfMonth.toISOString());
      })(),
    ]);

    // Sum up revenue
    const monthlyRevenueCents = (monthlyRevenueRes.data || []).reduce(
      (sum: number, p: { amount_cents: number }) => sum + (p.amount_cents || 0),
      0
    );

    return NextResponse.json({
      totalUsers: totalUsersRes.count || 0,
      activeUsers: activeUsersRes.count || 0,
      pendingReports: pendingReportsRes.count || 0,
      pendingVerifications: pendingVerificationsRes.count || 0,
      pendingHostApplications: pendingHostAppsRes.count || 0,
      upcomingEvents: upcomingEventsRes.count || 0,
      monthlyRevenueCents,
    });
  } catch (err) {
    console.error("Admin stats GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
