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
    const isFeatured = url.searchParams.get("is_featured");
    const search = url.searchParams.get("search");

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = (admin.from("events") as any)
      .select(
        `*, host:profiles!events_host_id_fkey(id, display_name, avatar_url)`,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status) query = query.eq("status", status);
    if (isFeatured === "true") query = query.eq("is_featured", true);
    if (isFeatured === "false") query = query.eq("is_featured", false);
    if (search) query = query.ilike("title", `%${search}%`);

    const { data, error, count } = await query;

    if (error) {
      console.error("Admin events fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch events" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      events: data || [],
      totalCount: count || 0,
      page,
      perPage,
    });
  } catch (err) {
    console.error("Admin events GET error:", err);
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

    const { eventIds, action } = body as {
      eventIds: string[];
      action: "approve" | "reject" | "feature" | "unfeature" | "cancel";
    };

    if (!eventIds?.length || !action) {
      return NextResponse.json(
        { error: "eventIds and action are required" },
        { status: 400 }
      );
    }

    let updates: Record<string, unknown> = {};

    switch (action) {
      case "approve":
        updates = { status: "published" };
        break;
      case "reject":
        updates = { status: "rejected" };
        break;
      case "feature":
        updates = { is_featured: true };
        break;
      case "unfeature":
        updates = { is_featured: false };
        break;
      case "cancel":
        updates = { status: "cancelled" };
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { data, error } = await (admin.from("events") as any)
      .update(updates)
      .in("id", eventIds)
      .select();

    if (error) {
      console.error("Admin events bulk update error:", error);
      return NextResponse.json(
        { error: "Failed to update events" },
        { status: 500 }
      );
    }

    // Audit log
    await (admin.from("audit_log") as any).insert({
      actor_id: auth.profile.id,
      action: `events_${action}`,
      target_type: "event",
      target_id: eventIds.join(","),
      metadata: {
        event_count: eventIds.length,
        admin_name: auth.profile.display_name,
      },
    });

    return NextResponse.json({ events: data || [], updated: (data || []).length });
  } catch (err) {
    console.error("Admin events PUT error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
