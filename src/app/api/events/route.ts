import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────
   GET /api/events — list published events
   ───────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const url = new URL(req.url);

    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const perPage = Math.min(
      50,
      Math.max(1, Number(url.searchParams.get("per_page")) || 12)
    );
    const eventType = url.searchParams.get("event_type");
    const format = url.searchParams.get("format");
    const city = url.searchParams.get("city");
    const search = url.searchParams.get("search");
    const dateFrom = url.searchParams.get("date_from");
    const dateTo = url.searchParams.get("date_to");

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // Build query
    let query = (supabase.from("events") as any)
      .select("*, host:profiles!events_host_id_fkey(id, display_name, avatar_url)", {
        count: "exact",
      })
      .eq("status", "published")
      .order("starts_at", { ascending: true })
      .gte("starts_at", new Date().toISOString())
      .range(from, to);

    if (eventType) query = query.eq("event_type", eventType);
    if (format) query = query.eq("format", format);
    if (city) query = query.ilike("venue_city", `%${city}%`);
    if (search) query = query.ilike("title", `%${search}%`);
    if (dateFrom) query = query.gte("starts_at", dateFrom);
    if (dateTo) query = query.lte("starts_at", dateTo);

    const { data, error, count } = await query;

    if (error) {
      console.error("Events fetch error:", error);
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
    console.error("Events GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ─────────────────────────────────────────────
   POST /api/events — create event
   ───────────────────────────────────────────── */

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) +
    "-" +
    Date.now().toString(36)
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has host or admin role
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("id, subscription_tier")
      .eq("id", user.id)
      .single();

    // For now, allow anyone with a profile to create events.
    // In production, check for host/admin role.
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found. Please complete onboarding." },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Basic validation
    if (!body.title || !body.description || !body.event_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const slug = generateSlug(body.title);

    const eventData = {
      host_id: user.id,
      title: body.title,
      slug,
      description: body.description,
      short_description: body.short_description || null,
      cover_image_url: body.cover_image_url || null,
      event_type: body.event_type,
      format: body.format || "in_person",
      theme: body.theme || null,
      starts_at: body.starts_at,
      ends_at: body.ends_at,
      timezone: body.timezone || "America/Toronto",
      venue_name: body.venue_name || null,
      venue_address: body.venue_address || null,
      venue_city: body.venue_city || null,
      venue_province: body.venue_province || null,
      venue_instructions: body.venue_instructions || null,
      virtual_room_url: body.virtual_room_url || null,
      virtual_platform: body.virtual_platform || null,
      capacity: body.capacity || null,
      current_attendees: 0,
      ticket_price_cents: body.ticket_price_cents || 0,
      currency: body.currency || "CAD",
      min_age: body.min_age || 18,
      requires_verification: body.requires_verification || false,
      dress_code: body.dress_code || null,
      rules: body.rules || [],
      consent_requirements: body.consent_requirements || [],
      byob: body.byob || false,
      catering_included: body.catering_included || false,
      status: "draft",
      is_featured: false,
    };

    const { data, error } = await (supabase.from("events") as any)
      .insert(eventData)
      .select()
      .single();

    if (error) {
      console.error("Event create error:", error);
      return NextResponse.json(
        { error: "Failed to create event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ event: data }, { status: 201 });
  } catch (err) {
    console.error("Events POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
