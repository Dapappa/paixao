import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────
   GET /api/profiles/[profileId]
   ───────────────────────────────────────────── */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await params;
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if blocked
    const { data: blockCheck } = await supabase.rpc("is_blocked" as never, {
      user_a: user.id,
      user_b: profileId,
    } as never);

    if (blockCheck) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Fetch profile with photos and interests
    const { data: profile, error } = await (supabase.from("profiles") as any)
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
        onboarding_completed,
        created_at,
        profile_photos!profile_photos_profile_id_fkey(
          id, url, is_primary, is_private, is_nsfw, order
        ),
        profile_interests!profile_interests_profile_id_fkey(
          interest_id,
          level,
          is_hard_limit,
          interests!profile_interests_interest_id_fkey(id, name, category, emoji)
        )
      `)
      .eq("id", profileId)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Respect profile_visibility
    if (profile.profile_visibility === "hidden" && profileId !== user.id) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    if (
      profile.profile_visibility === "matches_only" &&
      profileId !== user.id
    ) {
      // Check if there is an active match between these users
      const { data: matchRow } = await (supabase.from("matches") as any)
        .select("id")
        .or(
          `and(profile_a.eq.${user.id},profile_b.eq.${profileId}),and(profile_a.eq.${profileId},profile_b.eq.${user.id})`
        )
        .eq("status", "active")
        .single();

      if (!matchRow) {
        return NextResponse.json(
          { error: "Profile not found" },
          { status: 404 }
        );
      }
    }

    // Check if current user is matched with this profile
    const { data: existingMatch } = await (supabase.from("matches") as any)
      .select("id, conversation_id")
      .or(
        `and(profile_a.eq.${user.id},profile_b.eq.${profileId}),and(profile_a.eq.${profileId},profile_b.eq.${user.id})`
      )
      .eq("status", "active")
      .single();

    // Get the current user's interests for shared-interest tagging
    const { data: myInterests } = await (
      supabase.from("profile_interests") as any
    )
      .select("interest_id")
      .eq("profile_id", user.id);

    const myInterestIds = new Set<string>(
      (myInterests || []).map((i: { interest_id: string }) => i.interest_id)
    );

    // Transform interests
    const interests = (
      profile.profile_interests as Array<{
        interest_id: string;
        level: string;
        is_hard_limit: boolean;
        interests: {
          id: string;
          name: string;
          category: string;
          emoji: string;
        } | null;
      }>
    )
      .filter((i) => i.interests)
      .map((i) => ({
        id: i.interest_id,
        name: i.interests!.name,
        category: i.interests!.category,
        emoji: i.interests!.emoji,
        level: i.level,
        is_hard_limit: i.is_hard_limit,
        is_shared: myInterestIds.has(i.interest_id),
      }));

    // Filter photos — hide private/nsfw for non-matched users
    const isMatched = !!existingMatch;
    const photos = (
      profile.profile_photos as Array<{
        id: string;
        url: string;
        is_primary: boolean;
        is_private: boolean;
        is_nsfw: boolean;
        order: number;
      }>
    )
      .filter((p) => {
        if (profileId === user.id) return true; // Own profile
        if (p.is_private && !isMatched) return false;
        return true;
      })
      .sort((a, b) => a.order - b.order);

    // Calculate compatibility score
    const sharedCount = interests.filter((i) => i.is_shared).length;
    const compatibilityScore = Math.min(
      100,
      Math.round((sharedCount / Math.max(myInterestIds.size, 1)) * 100)
    );

    return NextResponse.json({
      profile: {
        id: profile.id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        tagline: profile.tagline,
        bio: profile.bio,
        gender: profile.gender,
        pronouns: profile.pronouns,
        sexuality: profile.sexuality,
        relationship_status: profile.relationship_status,
        looking_for: profile.looking_for,
        location: profile.location,
        experience_level: profile.experience_level,
        date_of_birth: profile.date_of_birth,
        created_at: profile.created_at,
        photos,
        interests,
        compatibility_score: compatibilityScore,
        shared_interest_count: sharedCount,
        is_matched: isMatched,
        match_id: existingMatch?.id || null,
        conversation_id: existingMatch?.conversation_id || null,
      },
    });
  } catch (err) {
    console.error("Profile GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
