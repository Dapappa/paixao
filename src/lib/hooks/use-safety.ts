"use client";

import { useState, useCallback } from "react";
import type { ReportInput, BlockInput, SafeWordInput } from "@/lib/utils/validators";

/* ─────────────────────────────────────────────
   Interfaces
   ───────────────────────────────────────────── */

export interface BlockedUser {
  id: string;
  blocked_id: string;
  reason: string | null;
  created_at: string;
  blocked: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface SafeWordRecord {
  id: string;
  safe_word_hash: string;
  emergency_contact_name: string | null;
  emergency_contact_method: string | null;
  emergency_contact_value: string | null;
  action_on_trigger: string;
  is_active: boolean;
  created_at: string;
}

export interface ReportResult {
  id: string;
  status: string;
  severity: string;
  created_at: string;
}

/* ─────────────────────────────────────────────
   useSafety — safety & moderation actions
   ───────────────────────────────────────────── */

export function useSafety() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReport = useCallback(
    async (data: ReportInput): Promise<ReportResult | null> => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/safety/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to submit report");
        }

        return await res.json();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const blockUser = useCallback(
    async (id: string, reason?: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const payload: BlockInput = { blocked_id: id };
        if (reason) payload.reason = reason;

        const res = await fetch("/api/safety/block", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to block user");
        }

        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        setError(msg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const unblockUser = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/safety/block/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to unblock user");
      }

      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBlockedUsers = useCallback(async (): Promise<BlockedUser[]> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/safety/block/list");

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to fetch blocked users");
      }

      const data = await res.json();
      return data.blocked || [];
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerPanic = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/safety/panic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to send panic alert");
      }

      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSafeWords = useCallback(async (): Promise<SafeWordRecord[]> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/safety/safe-word");

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to fetch safe words");
      }

      const data = await res.json();
      return data.safe_words || [];
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSafeWord = useCallback(
    async (data: SafeWordInput): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/safety/safe-word", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to update safe word");
        }

        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        setError(msg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    submitReport,
    blockUser,
    unblockUser,
    getBlockedUsers,
    triggerPanic,
    getSafeWords,
    updateSafeWord,
    loading,
    error,
  };
}
