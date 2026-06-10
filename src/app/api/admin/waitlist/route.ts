import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/verify-admin";
import { createAdminClient } from "@/lib/supabase/admin";

/* ─────────────────────────────────────────────
   GET /api/admin/waitlist
   Admin-only — lists waitlist signups with totals.
   Reads via the service-role client (the waitlist
   table is RLS-locked to server-side only).
   ───────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const admin = createAdminClient();
    const url = new URL(req.url);

    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const perPage = Math.min(
      50,
      Math.max(1, Number(url.searchParams.get("per_page")) || 20),
    );
    const search = url.searchParams.get("search");
    const status = url.searchParams.get("status");

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // Total signups (all statuses).
    const { count: totalCount, error: totalErr } = await (
      admin.from("waitlist") as any
    ).select("*", { count: "exact", head: true });

    // Paid founding members.
    const { count: founderCount, error: founderErr } = await (
      admin.from("waitlist") as any
    )
      .select("*", { count: "exact", head: true })
      .eq("is_founding", true);

    if (totalErr || founderErr) {
      console.error(
        "Admin waitlist count error:",
        totalErr || founderErr,
      );
      return NextResponse.json(
        { error: "Failed to fetch waitlist" },
        { status: 500 },
      );
    }

    let query = (admin.from("waitlist") as any)
      .select(
        `id, email, city, interested_in, source, status, is_founding, amount_cents, currency, founding_paid_at, created_at`,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.ilike("email", `%${search}%`);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Admin waitlist fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch waitlist" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      signups: data || [],
      // Count of rows matching the current filter (drives pagination).
      filteredCount: count || 0,
      totalCount: totalCount || 0,
      founderCount: founderCount || 0,
      page,
      perPage,
    });
  } catch (err) {
    console.error("Admin waitlist GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
