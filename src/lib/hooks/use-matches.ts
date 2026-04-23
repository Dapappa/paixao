"use client";

import { useState, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────
   Candidate / Connection interfaces
   ───────────────────────────────────────────── */

export interface CandidatePhoto {
  id: string;
  url: string;
  is_primary: boolean;
  order: number;
}

export interface CandidateInterest {
  id: string;
  name: string;
  category: string;
  emoji: string;
  level: string;
  is_shared: boolean;
}

export interface MatchCandidate {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  tagline: string | null;
  bio: string | null;
  gender: string | null;
  pronouns: string | null;
  sexuality: string | null;
  relationship_status: string | null;
  looking_for: string[];
  location: string | null;
  experience_level: string | null;
  date_of_birth: string | null;
  primary_photo: CandidatePhoto | null;
  photos: CandidatePhoto[];
  interests: CandidateInterest[];
  shared_interest_count: number;
  compatibility_score: number;
}

export interface MatchConnection {
  match_id: string;
  conversation_id: string | null;
  matched_at: string;
  status: string;
  profile: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    tagline: string | null;
  } | null;
}

export interface MatchActionResult {
  action: string;
  matched: boolean;
  match_id: string | null;
  conversation_id: string | null;
}

/* ─────────────────────────────────────────────
   useMatches — discovery candidates
   ───────────────────────────────────────────── */

interface UseMatchesFilters {
  genders?: string[];
  min_age?: number;
  max_age?: number;
  experience_levels?: string[];
  min_shared_interests?: number;
}

interface UseMatchesReturn {
  candidates: MatchCandidate[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  refetch: () => void;
  fetchMore: () => void;
}

export function useMatches(
  filters: UseMatchesFilters = {}
): UseMatchesReturn {
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchCandidates = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("page", String(pageNum));
        params.set("limit", "20");

        if (filters.genders && filters.genders.length > 0) {
          params.set("genders", filters.genders.join(","));
        }
        if (filters.min_age) params.set("min_age", String(filters.min_age));
        if (filters.max_age) params.set("max_age", String(filters.max_age));
        if (filters.experience_levels && filters.experience_levels.length > 0) {
          params.set(
            "experience_levels",
            filters.experience_levels.join(",")
          );
        }
        if (filters.min_shared_interests) {
          params.set(
            "min_shared_interests",
            String(filters.min_shared_interests)
          );
        }

        const res = await fetch(`/api/matches?${params.toString()}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to fetch candidates");
        }

        const data = await res.json();
        setCandidates((prev) =>
          append ? [...prev, ...(data.candidates || [])] : data.candidates || []
        );
        setHasMore(data.hasMore ?? false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [
      filters.genders?.join(","),
      filters.min_age,
      filters.max_age,
      filters.experience_levels?.join(","),
      filters.min_shared_interests,
    ]
  );

  useEffect(() => {
    setPage(1);
    fetchCandidates(1);
  }, [fetchCandidates]);

  const refetch = useCallback(() => {
    setPage(1);
    fetchCandidates(1);
  }, [fetchCandidates]);

  const fetchMore = useCallback(() => {
    const next = page + 1;
    setPage(next);
    fetchCandidates(next, true);
  }, [page, fetchCandidates]);

  return { candidates, loading, error, hasMore, refetch, fetchMore };
}

/* ─────────────────────────────────────────────
   useMatchAction — like / pass / super_like
   ───────────────────────────────────────────── */

interface UseMatchActionReturn {
  performAction: (
    targetId: string,
    action: "like" | "pass" | "super_like"
  ) => Promise<MatchActionResult | null>;
  loading: boolean;
  lastResult: MatchActionResult | null;
}

export function useMatchAction(): UseMatchActionReturn {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<MatchActionResult | null>(null);

  const performAction = useCallback(
    async (
      targetId: string,
      action: "like" | "pass" | "super_like"
    ): Promise<MatchActionResult | null> => {
      setLoading(true);

      try {
        const res = await fetch("/api/matches/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target_id: targetId, action }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to perform action");
        }

        const result: MatchActionResult = await res.json();
        setLastResult(result);
        return result;
      } catch {
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { performAction, loading, lastResult };
}

/* ─────────────────────────────────────────────
   useConnections — mutual matches
   ───────────────────────────────────────────── */

interface UseConnectionsReturn {
  connections: MatchConnection[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => void;
}

export function useConnections(): UseConnectionsReturn {
  const [connections, setConnections] = useState<MatchConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchConnections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/matches/connections");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to fetch connections");
      }

      const data = await res.json();
      setConnections(data.connections || []);
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  return { connections, loading, error, totalCount, refetch: fetchConnections };
}
