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
    const severity = url.searchParams.get("severity");
    const category = url.searchParams.get("category");

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = (admin.from("reports") as any)
      .select(
        `*, reporter:profiles!reports_reporter_id_fkey(id, display_name, avatar_url), reported_user:profiles!reports_reported_user_id_fkey(id, display_name, avatar_url)`,
        { count: "exact" }
      )
      .range(from, to);

    if (status) {
      query = query.eq("status", status);
    }
    if (severity) {
      query = query.eq("severity", severity);
    }
    if (category) {
      query = query.eq("category", category);
    }

    // Order: critical first, then high, then by oldest first
    query = query
      .order("severity", { ascending: true })
      .order("created_at", { ascending: true });

    const { data, error, count } = await query;

    if (error) {
      console.error("Admin reports fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch reports" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reports: data || [],
      totalCount: count || 0,
      page,
      perPage,
    });
  } catch (err) {
    console.error("Admin reports GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
