"use client";

import { useState, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────
   Match Preferences interface
   ───────────────────────────────────────────── */

export interface MatchPreferences {
  profile_id: string;
  preferred_genders: string[];
  min_age: number;
  max_age: number;
  preferred_experience_levels: string[];
  max_distance_km: number | null;
  preferred_relationship_types: string[];
  deal_breakers: string[];
}

interface UseMatchPreferencesReturn {
  preferences: MatchPreferences | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  updatePreferences: (
    updates: Partial<MatchPreferences>
  ) => Promise<MatchPreferences | null>;
}

export function useMatchPreferences(): UseMatchPreferencesReturn {
  const [preferences, setPreferences] = useState<MatchPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/matches/preferences");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to fetch preferences");
      }

      const data = await res.json();
      setPreferences(data.preferences || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = useCallback(
    async (
      updates: Partial<MatchPreferences>
    ): Promise<MatchPreferences | null> => {
      setSaving(true);
      setError(null);

      try {
        const merged = { ...(preferences || {}), ...updates };

        const res = await fetch("/api/matches/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(merged),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to update preferences");
        }

        const data = await res.json();
        setPreferences(data.preferences);
        return data.preferences;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [preferences]
  );

  return { preferences, loading, error, saving, updatePreferences };
}
