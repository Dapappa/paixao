"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

/* ─────────────────────────────────────────────
   Event interfaces (mirrors DB columns)
   ───────────────────────────────────────────── */

export interface EventRow {
  id: string;
  host_id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string | null;
  cover_image_url: string | null;
  event_type: string;
  format: string;
  theme: string | null;
  starts_at: string;
  ends_at: string;
  timezone: string;
  venue_name: string | null;
  venue_address: string | null;
  venue_city: string | null;
  venue_province: string | null;
  venue_instructions: string | null;
  virtual_room_url: string | null;
  virtual_platform: string | null;
  capacity: number | null;
  current_attendees: number;
  ticket_price_cents: number;
  currency: string;
  min_age: number;
  allowed_genders: string[] | null;
  allowed_relationship_statuses: string[] | null;
  requires_verification: boolean;
  dress_code: string | null;
  rules: string[];
  consent_requirements: string[];
  byob: boolean;
  catering_included: boolean;
  host_compensation_type: string | null;
  host_compensation_amount_cents: number | null;
  status: string;
  is_featured: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventWithHost extends EventRow {
  host?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface EventFilters {
  event_type?: string;
  format?: string;
  city?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

interface UseEventsOptions {
  filters?: EventFilters;
  page?: number;
  perPage?: number;
  enabled?: boolean;
}

interface UseEventsReturn {
  events: EventWithHost[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  refetch: () => void;
}

export function useEvents({
  filters = {},
  page: initialPage = 1,
  perPage = 12,
  enabled = true,
}: UseEventsOptions = {}): UseEventsReturn {
  const [events, setEvents] = useState<EventWithHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(initialPage);

  const fetchEvents = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("per_page", String(perPage));

      if (filters.event_type) params.set("event_type", filters.event_type);
      if (filters.format) params.set("format", filters.format);
      if (filters.city) params.set("city", filters.city);
      if (filters.search) params.set("search", filters.search);
      if (filters.date_from) params.set("date_from", filters.date_from);
      if (filters.date_to) params.set("date_to", filters.date_to);

      const res = await fetch(`/api/events?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to fetch events");
      }

      const data = await res.json();
      setEvents(data.events ?? []);
      setTotalCount(data.totalCount ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [enabled, page, perPage, filters.event_type, filters.format, filters.city, filters.search, filters.date_from, filters.date_to]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / perPage),
    setPage,
    refetch: fetchEvents,
  };
}
