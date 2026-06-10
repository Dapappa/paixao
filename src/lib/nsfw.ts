/**
 * Content sensitivity model for Paixão.
 *
 *   sfw      — Tier 0. Marketing-safe, ad-network-safe. Public.
 *   sensual  — Tier 1. Boudoir / implied / silhouette. Behind the age gate.
 *   explicit — Tier 2. Real, verified-member / licensed explicit content.
 *              Lives behind auth + age-verification + opt-in, served from an
 *              adult-friendly domain. NEVER AI-generated.
 *
 * The gate is consent-first: nothing above a user's chosen level is shown
 * without an explicit, reversible reveal.
 */
export type ContentLevel = "sfw" | "sensual" | "explicit";

export const CONTENT_LEVELS: ContentLevel[] = ["sfw", "sensual", "explicit"];

export const CONTENT_LEVEL_LABEL: Record<ContentLevel, string> = {
  sfw: "Safe",
  sensual: "Sensual",
  explicit: "Explicit",
};

/** Is `level` at or above the `min` threshold? */
export function meetsLevel(level: ContentLevel, min: ContentLevel): boolean {
  return CONTENT_LEVELS.indexOf(level) >= CONTENT_LEVELS.indexOf(min);
}

/** The default a brand-new (age-verified) member sees until they opt up. */
export const DEFAULT_VIEW_LEVEL: ContentLevel = "sensual";
