import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────
   GET /api/matches — discovery candidates
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
    const limit = Math.min(20, Math.max(1, Number(url.searchParams.get("limit")) || 20));
    const genderFilter = url.searchParams.get("genders"); // comma-separated
    const minAge = Number(url.searchParams.get("min_age")) || null;
    const maxAge = Number(url.searchParams.get("max_age")) || null;
    const experienceFilter = url.searchParams.get("experience_levels"); // comma-separated
    const minSharedInterests = Number(url.searchParams.get("min_shared_interests")) || 0;

    const offset = (page - 1) * limit;

    // Fetch user's match preferences
    const { data: prefs } = await (supabase.from("match_preferences") as any)
      .select("*")
      .eq("profile_id", user.id)
      .single();

    // Effective filters — URL params override preferences
    const effectiveGenders = genderFilter
      ? genderFilter.split(",").filter(Boolean)
      : prefs?.preferred_genders || [];
    const effectiveMinAge = minAge || prefs?.min_age || 18;
    const effectiveMaxAge = maxAge || prefs?.max_age || 99;
    const effectiveExpLevels = experienceFilter
      ? experienceFilter.split(",").filter(Boolean)
      : prefs?.preferred_experience_levels || [];

    // Calculate DOB range from age
    const now = new Date();
    const maxDob = new Date(now.getFullYear() - effectiveMinAge, now.getMonth(), now.getDate()).toISOString();
    const minDob = new Date(now.getFullYear() - effectiveMaxAge - 1, now.getMonth(), now.getDate()).toISOString();

    // Build candidate query using RPC or manual query
    // We query profiles with filters, excluding current user, blocked, and already-acted-on
    let query = (supabase.from("profiles") as any)
      .select(`
        id,
        display_name,
        avatar_url,
        tagline,
        bio,
        gender,
        pronouns,
        sexuality,
        relationship_status,
        looking_for,
        location,
        experience_level,
        date_of_birth,
        profile_visibility,
        profile_photos!profile_photos_profile_id_fkey(id, url, is_primary, order),
        profile_interests!profile_interests_profile_id_fkey(
          interest_id,
          level,
          interests!profile_interests_interest_id_fkey(id, name, category, emoji)
        )
      `, { count: "exact" })
      .eq("profile_visibility", "visible")
      .eq("onboarding_completed", true)
      .neq("id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by gender preferences
    if (effectiveGenders.length > 0) {
      query = query.in("gender", effectiveGenders);
    }

    // Filter by DOB / age range
    if (effectiveMinAge > 18) {
      query = query.lte("date_of_birth", maxDob);
    }
    if (effectiveMaxAge < 99) {
      query = query.gte("date_of_birth", minDob);
    }

    // Filter by experience level
    if (effectiveExpLevels.length > 0) {
      query = query.in("experience_level", effectiveExpLevels);
    }

    const { data: rawCandidates, error: queryError, count } = await query;

    if (queryError) {
      console.error("Candidates fetch error:", queryError);
      return NextResponse.json(
        { error: "Failed to fetch candidates" },
        { status: 500 }
      );
    }

    if (!rawCandidates || rawCandidates.length === 0) {
      return NextResponse.json({
        candidates: [],
        totalCount: 0,
        page,
        hasMore: false,
      });
    }

    // Get blocked user IDs to exclude
    const { data: blockedRows } = await (supabase.from("blocks") as any)
      .select("blocked_id, blocker_id")
      .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);

    const blockedIds = new Set<string>();
    if (blockedRows) {
      for (const row of blockedRows) {
        if (row.blocker_id === user.id) blockedIds.add(row.blocked_id);
        if (row.blocked_id === user.id) blockedIds.add(row.blocker_id);
      }
    }

    // Get already-acted-on user IDs
    const { data: actedRows } = await (supabase.from("match_actions") as any)
      .select("target_id")
      .eq("actor_id", user.id);

    const actedIds = new Set<string>();
    if (actedRows) {
      for (const row of actedRows) {
        actedIds.add(row.target_id);
      }
    }

    // Get current user's interests for compatibility scoring
    const { data: myInterests } = await (supabase.from("profile_interests") as any)
      .select("interest_id")
      .eq("profile_id", user.id);

    const myInterestIds = new Set<string>(
      (myInterests || []).map((i: { interest_id: string }) => i.interest_id)
    );

    // Filter out blocked and already-acted-on users, compute compatibility
    const candidates = rawCandidates
      .filter((c: { id: string }) => !blockedIds.has(c.id) && !actedIds.has(c.id))
      .map((c: Record<string, unknown>) => {
        const interests = (c.profile_interests as Array<{
          interest_id: string;
          level: string;
          interests: { id: string; name: string; category: string; emoji: string } | null;
        }>) || [];

        const sharedInterests = interests.filter(
          (i) => myInterestIds.has(i.interest_id)
        );

        const compatibilityScore = Math.min(
          100,
          Math.round((sharedInterests.length / Math.max(myInterestIds.size, 1)) * 100)
        );

        const photos = (c.profile_photos as Array<{
          id: string;
          url: string;
          is_primary: boolean;
          order: number;
        }>) || [];

        const primaryPhoto = photos.find((p) => p.is_primary) || photos[0] || null;

        return {
          id: c.id,
          display_name: c.display_name,
          avatar_url: c.avatar_url,
          tagline: c.tagline,
          bio: c.bio,
          gender: c.gender,
          pronouns: c.pronouns,
          sexuality: c.sexuality,
          relationship_status: c.relationship_status,
          looking_for: c.looking_for,
          location: c.location,
          experience_level: c.experience_level,
          date_of_birth: c.date_of_birth,
          primary_photo: primaryPhoto,
          photos,
          interests: interests
            .filter((i) => i.interests)
            .map((i) => ({
              id: i.interest_id,
              name: i.interests!.name,
              category: i.interests!.category,
              emoji: i.interests!.emoji,
              level: i.level,
              is_shared: myInterestIds.has(i.interest_id),
            })),
          shared_interest_count: sharedInterests.length,
          compatibility_score: compatibilityScore,
        };
      })
      .filter(
        (c: { shared_interest_count: number }) =>
          minSharedInterests > 0 ? c.shared_interest_count >= minSharedInterests : true
      );

    return NextResponse.json({
      candidates,
      totalCount: count || candidates.length,
      page,
      hasMore: candidates.length === limit,
    });
  } catch (err) {
    console.error("Matches GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
