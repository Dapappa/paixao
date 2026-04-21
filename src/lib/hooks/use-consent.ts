"use client";

import { useState, useCallback } from "react";

interface ConsentState {
  loading: boolean;
  error: string | null;
}

export function useConsent() {
  const [state, setState] = useState<ConsentState>({
    loading: false,
    error: null,
  });

  const recordConsent = useCallback(
    async (
      consentType: string,
      contextType: string,
      contextId: string,
      details?: Record<string, unknown>
    ) => {
      setState({ loading: true, error: null });

      try {
        const res = await fetch("/api/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            consent_type: consentType,
            context_type: contextType,
            context_id: contextId,
            details,
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to record consent");
        }

        const data = await res.json();
        setState({ loading: false, error: null });
        return data;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to record consent";
        setState({ loading: false, error: msg });
        throw err;
      }
    },
    []
  );

  const checkConsent = useCallback(
    async (
      consentType: string,
      contextType: string,
      contextId: string
    ): Promise<boolean> => {
      try {
        const params = new URLSearchParams({
          consent_type: consentType,
          context_type: contextType,
          context_id: contextId,
        });

        const res = await fetch(`/api/consent/verify?${params.toString()}`);
        if (!res.ok) return false;

        const data = await res.json();
        return data.exists === true;
      } catch {
        return false;
      }
    },
    []
  );

  return {
    ...state,
    recordConsent,
    checkConsent,
  };
}
