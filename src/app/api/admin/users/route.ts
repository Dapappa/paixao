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
    const search = url.searchParams.get("search");
    const role = url.searchParams.get("role");
    const tier = url.searchParams.get("tier");
    const isBanned = url.searchParams.get("is_banned");
    const isVerified = url.searchParams.get("is_verified");

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = (admin.from("profiles") as any)
      .select(
        `id, display_name, avatar_url, role, subscription_tier, is_banned, is_verified, last_active_at, created_at, email`,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.ilike("display_name", `%${search}%`);
    }
    if (role) {
      query = query.eq("role", role);
    }
    if (tier) {
      query = query.eq("subscription_tier", tier);
    }
    if (isBanned === "true") {
      query = query.eq("is_banned", true);
    } else if (isBanned === "false") {
      query = query.eq("is_banned", false);
    }
    if (isVerified === "true") {
      query = query.eq("is_verified", true);
    } else if (isVerified === "false") {
      query = query.eq("is_verified", false);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Admin users fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: data || [],
      totalCount: count || 0,
      page,
      perPage,
    });
  } catch (err) {
    console.error("Admin users GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
