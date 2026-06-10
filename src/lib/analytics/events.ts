/**
 * Analytics event taxonomy — the single source of truth for every event the
 * client may fire. Keeping the names and payloads typed here prevents drift
 * between call sites and whichever vendor is wired up at runtime.
 */

export type AnalyticsEventName =
  | 'pageview'
  | 'waitlist_signup'
  | 'founding_checkout_start';

/** Arbitrary, JSON-serialisable properties attached to an event. */
export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  props?: AnalyticsProps;
}
