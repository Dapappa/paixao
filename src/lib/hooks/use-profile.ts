"use client";

import { useEffect, useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore, type Profile } from "@/lib/stores/auth-store";

export function useProfile() {
  const { user, profile, setProfile } = useAuthStore();
  const [loading, setLoading] = useState(!profile);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: fetchError } = await (supabase
        .from("profiles") as any)
        .select("*")
        .eq("id", user.id)
        .single();

      if (fetchError) {
        // Profile might not exist yet for new users
        if (fetchError.code === "PGRST116") {
          setProfile({
            id: user.id,
            display_name: null,
            avatar_url: null,
            tagline: null,
            bio: null,
            gender: null,
            pronouns: null,
            sexuality: null,
            relationship_status: null,
            looking_for: [],
            location: null,
            experience_level: null,
            interests: [],
            boundaries: [],
            profile_visibility: "visible",
            onboarding_completed: false,
            subscription_tier: "curious",
            photos: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          throw fetchError;
        }
      } else {
        setProfile(data as unknown as Profile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, [user, setProfile]);

  useEffect(() => {
    if (user && !profile) {
      fetchProfile();
    } else if (!user) {
      setLoading(false);
    }
  }, [user, profile, fetchProfile]);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) return;

      try {
        const supabase = createClient();
        const updatePayload = {
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        };
        const { data, error: updateError } = await (supabase
          .from("profiles") as any)
          .upsert(updatePayload)
          .select()
          .single();

        if (updateError) throw updateError;

        const merged = { ...(profile || {}), ...(data || {}) } as Profile;
        setProfile(merged);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update profile"
        );
        throw err;
      }
    },
    [user, profile, setProfile]
  );

  const refetch = useCallback(() => {
    setProfile(null);
    return fetchProfile();
  }, [fetchProfile, setProfile]);

  return { profile, loading, error, updateProfile, refetch };
}
