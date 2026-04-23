import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────
   GET /api/matches/connections — mutual matches
   ───────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 20));
    const offset = (page - 1) * limit;

    // Get matches where user is either profile_a or profile_b
    const { data: matches, error, count } = await (supabase.from("matches") as any)
      .select(`
        id,
        profile_a,
        profile_b,
        status,
        matched_at,
        conversation_id,
        profile_a_profile:profiles!matches_profile_a_fkey(
          id, display_name, avatar_url, tagline, profile_visibility
        ),
        profile_b_profile:profiles!matches_profile_b_fkey(
          id, display_name, avatar_url, tagline, profile_visibility
        )
      `, { count: "exact" })
      .or(`profile_a.eq.${user.id},profile_b.eq.${user.id}`)
      .eq("status", "active")
      .order("matched_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Connections fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch connections" },
        { status: 500 }
      );
    }

    // Transform to show the OTHER user's info
    const connections = (matches || []).map(
      (m: {
        id: string;
        profile_a: string;
        profile_b: string;
        status: string;
        matched_at: string;
        conversation_id: string | null;
        profile_a_profile: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          tagline: string | null;
          profile_visibility: string;
        } | null;
        profile_b_profile: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          tagline: string | null;
          profile_visibility: string;
        } | null;
      }) => {
        const isA = m.profile_a === user.id;
        const otherProfile = isA ? m.profile_b_profile : m.profile_a_profile;

        return {
          match_id: m.id,
          conversation_id: m.conversation_id,
          matched_at: m.matched_at,
          status: m.status,
          profile: otherProfile
            ? {
                id: otherProfile.id,
                display_name: otherProfile.display_name,
                avatar_url: otherProfile.avatar_url,
                tagline: otherProfile.tagline,
              }
            : null,
        };
      }
    );

    return NextResponse.json({
      connections,
      totalCount: count || 0,
      page,
      hasMore: connections.length === limit,
    });
  } catch (err) {
    console.error("Connections GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
