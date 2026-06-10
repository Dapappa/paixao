import { createClient } from "@/lib/supabase/server";
import { ProfileViewClient } from "./profile-view-client";
import type { ProfileData } from "@/components/matches/profile-preview";

export const metadata = {
  title: "Profile | Paixão",
  description: "View a member profile",
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialProfile: ProfileData | null = null;

  if (user) {
    try {
      // Fetch via internal logic (mirroring API route for SSR)
      const { data: blockCheck } = await supabase.rpc("is_blocked" as never, {
        user_a: user.id,
        user_b: profileId,
      } as never);

      if (!blockCheck) {
        const { data: profile } = await (supabase.from("profiles") as any)
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
            created_at,
            profile_photos!profile_photos_profile_id_fkey(
              id, url, is_primary, is_private, is_nsfw, order
            ),
            profile_interests!profile_interests_profile_id_fkey(
              interest_id, level, is_hard_limit,
              interests!profile_interests_interest_id_fkey(id, name, category, emoji)
            )
          `)
          .eq("id", profileId)
          .single();

        if (profile && profile.profile_visibility !== "hidden") {
          // Check match status
          const { data: existingMatch } = await (supabase.from("matches") as any)
            .select("id, conversation_id")
            .or(
              `and(profile_a.eq.${user.id},profile_b.eq.${profileId}),and(profile_a.eq.${profileId},profile_b.eq.${user.id})`
            )
            .eq("status", "active")
            .single();

          const isMatched = !!existingMatch;

          // If matches_only and not matched, don't show
          if (profile.profile_visibility === "matches_only" && !isMatched) {
            // Leave initialProfile null, client will handle 404
          } else {
            // Get my interests for shared tagging
            const { data: myInterests } = await (supabase.from("profile_interests") as any)
              .select("interest_id")
              .eq("profile_id", user.id);

            const myInterestIds = new Set<string>(
              (myInterests || []).map((i: { interest_id: string }) => i.interest_id)
            );

            const interests = (profile.profile_interests || [])
              .filter((i: { interests: unknown }) => i.interests)
              .map(
                (i: {
                  interest_id: string;
                  level: string;
                  is_hard_limit: boolean;
                  interests: { id: string; name: string; category: string; emoji: string };
                }) => ({
                  id: i.interest_id,
                  name: i.interests.name,
                  category: i.interests.category,
                  emoji: i.interests.emoji,
                  level: i.level,
                  is_hard_limit: i.is_hard_limit,
                  is_shared: myInterestIds.has(i.interest_id),
                })
              );

            const photos = (profile.profile_photos || [])
              .filter((p: { is_private: boolean }) => {
                if (profileId === user.id) return true;
                if (p.is_private && !isMatched) return false;
                return true;
              })
              .sort((a: { order: number }, b: { order: number }) => a.order - b.order);

            const sharedCount = interests.filter(
              (i: { is_shared: boolean }) => i.is_shared
            ).length;

            initialProfile = {
              id: profile.id,
              display_name: profile.display_name,
              avatar_url: profile.avatar_url,
              tagline: profile.tagline,
              bio: profile.bio,
              gender: profile.gender,
              pronouns: profile.pronouns,
              sexuality: profile.sexuality,
              relationship_status: profile.relationship_status,
              looking_for: profile.looking_for || [],
              location: profile.location,
              experience_level: profile.experience_level,
              date_of_birth: profile.date_of_birth,
              created_at: profile.created_at,
              photos,
              interests,
              compatibility_score: Math.min(
                100,
                Math.round(
                  (sharedCount / Math.max(myInterestIds.size, 1)) * 100
                )
              ),
              shared_interest_count: sharedCount,
              is_matched: isMatched,
              match_id: existingMatch?.id || null,
              conversation_id: existingMatch?.conversation_id || null,
            };
          }
        }
      }
    } catch {
      // Profile fetch failed, client will handle fallback
    }
  }

  return (
    <ProfileViewClient profileId={profileId} initialProfile={initialProfile} />
  );
}
