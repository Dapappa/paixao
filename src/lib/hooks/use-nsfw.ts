"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  type ContentLevel,
  DEFAULT_VIEW_LEVEL,
  meetsLevel,
} from "@/lib/nsfw";

/**
 * The member's chosen maximum content level to *view*. Persisted to
 * localStorage for now; when Supabase is wired this should sync to a
 * `profiles.nsfw_view_level` column (server-authoritative) so it follows the
 * account across devices and can be gated by age-verification status.
 */
const KEY = "paixao_nsfw_view_level";
const listeners = new Set<() => void>();

function read(): ContentLevel {
  if (typeof window === "undefined") return DEFAULT_VIEW_LEVEL;
  const v = window.localStorage.getItem(KEY) as ContentLevel | null;
  return v ?? DEFAULT_VIEW_LEVEL;
}

function write(level: ContentLevel) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, level);
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useNsfw() {
  const viewLevel = useSyncExternalStore(subscribe, read, () => DEFAULT_VIEW_LEVEL);

  const setViewLevel = useCallback((level: ContentLevel) => write(level), []);

  /** Can the member currently see content at `level`? */
  const canView = useCallback(
    (level: ContentLevel) => meetsLevel(viewLevel, level),
    [viewLevel],
  );

  /** Opt up to at least `level` (a reveal action). Never opts down. */
  const revealUpTo = useCallback(
    (level: ContentLevel) => {
      if (!meetsLevel(viewLevel, level)) write(level);
    },
    [viewLevel],
  );

  return { viewLevel, setViewLevel, canView, revealUpTo };
}
