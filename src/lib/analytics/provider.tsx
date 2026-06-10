"use client";

/**
 * Analytics provider + hook.
 *
 * Mount <AnalyticsProvider /> once near the root of a client tree. It
 * initialises the configured vendor (PostHog / Plausible / dev console) and
 * fires a `pageview` event on every route change. Consume `useAnalytics()`
 * anywhere below it to fire custom events in a vendor-agnostic way.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initAnalytics, track } from "./client";
import type { AnalyticsEventName, AnalyticsProps } from "./events";

interface AnalyticsContextValue {
  track: (name: AnalyticsEventName, props?: AnalyticsProps) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string | null>(null);

  // Initialise the vendor SDK once on mount.
  useEffect(() => {
    initAnalytics();
  }, []);

  // Fire a pageview whenever the path changes (ignores pure hash changes;
  // includes the query string so attribution params are captured).
  useEffect(() => {
    const query = searchParams?.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    if (lastPath.current === path) return;
    lastPath.current = path;
    track("pageview", { path: pathname, ...(query ? { query } : {}) });
  }, [pathname, searchParams]);

  const value = useMemo<AnalyticsContextValue>(() => ({ track }), []);

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * Access the tracker. Falls back to the standalone `track` if used outside a
 * provider, so call sites never crash for a missing provider.
 */
export function useAnalytics(): AnalyticsContextValue {
  const ctx = useContext(AnalyticsContext);
  return ctx ?? { track };
}
