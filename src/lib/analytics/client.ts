/**
 * Vendor-agnostic client-side analytics tracker.
 *
 * Dispatches events to whichever provider is configured via NEXT_PUBLIC env
 * vars (PostHog or Plausible). When nothing is configured it falls back to a
 * dev-only console log so events are still observable while building locally.
 *
 * This module is browser-only — every function is a no-op on the server.
 */

import type { AnalyticsEventName, AnalyticsProps } from './events';

type Provider = 'posthog' | 'plausible' | 'console' | 'none';

declare global {
  interface Window {
    // PostHog injects this global once its snippet loads.
    posthog?: {
      capture: (event: string, props?: Record<string, unknown>) => void;
      __loaded?: boolean;
    };
    // Plausible injects this global once its script loads.
    plausible?: (
      event: string,
      options?: { props?: Record<string, unknown> },
    ) => void;
  }
}

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const PLAUSIBLE_SRC =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ||
  'https://plausible.io/js/script.js';

const isBrowser = typeof window !== 'undefined';
const isDev = process.env.NODE_ENV !== 'production';

/** Which provider this build is configured for. PostHog wins if both are set. */
export function resolveProvider(): Provider {
  if (POSTHOG_KEY) return 'posthog';
  if (PLAUSIBLE_DOMAIN) return 'plausible';
  return isDev ? 'console' : 'none';
}

let initialized = false;

/**
 * Lazily load the configured provider's SDK/snippet. Safe to call repeatedly —
 * it only runs once. No-op on the server or when no provider is configured.
 */
export function initAnalytics(): void {
  if (!isBrowser || initialized) return;
  initialized = true;

  const provider = resolveProvider();

  if (provider === 'posthog' && !window.posthog) {
    loadPostHog();
  } else if (provider === 'plausible' && !window.plausible) {
    loadPlausible();
  }
}

function loadPostHog(): void {
  // Minimal PostHog loader. Avoids the npm dependency by injecting the CDN
  // snippet and stubbing capture() so events fired before load are queued.
  const queue: Array<[string, Record<string, unknown> | undefined]> = [];
  window.posthog = {
    capture: (event, props) => queue.push([event, props]),
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = `${POSTHOG_HOST.replace(/\/$/, '')}/static/array.js`;
  script.onload = () => {
    try {
      const ph = window.posthog as unknown as {
        init?: (key: string, opts: Record<string, unknown>) => void;
        capture: (e: string, p?: Record<string, unknown>) => void;
      };
      ph.init?.(POSTHOG_KEY as string, { api_host: POSTHOG_HOST });
      // Flush anything captured before the SDK was ready.
      for (const [event, props] of queue) ph.capture(event, props);
    } catch (err) {
      if (isDev) console.warn('[analytics] PostHog init failed', err);
    }
  };
  document.head.appendChild(script);
}

function loadPlausible(): void {
  if (document.querySelector('script[data-analytics="plausible"]')) return;
  const script = document.createElement('script');
  script.defer = true;
  script.setAttribute('data-domain', PLAUSIBLE_DOMAIN as string);
  script.setAttribute('data-analytics', 'plausible');
  script.src = PLAUSIBLE_SRC;
  document.head.appendChild(script);

  // Stub so events fired before the script loads are not lost.
  if (!window.plausible) {
    const q: unknown[] = [];
    const fn = ((...args: unknown[]) => q.push(args)) as Window['plausible'] & {
      q?: unknown[];
    };
    fn.q = q;
    window.plausible = fn;
  }
}

/**
 * Fire a tracking event through the configured provider. No-op on the server.
 */
export function track(name: AnalyticsEventName, props?: AnalyticsProps): void {
  if (!isBrowser) return;

  const provider = resolveProvider();
  const clean = stripUndefined(props);

  switch (provider) {
    case 'posthog':
      window.posthog?.capture(name, clean);
      break;
    case 'plausible':
      window.plausible?.(name, clean ? { props: clean } : undefined);
      break;
    case 'console':
      // Dev fallback so events are visible without a configured vendor.
      // eslint-disable-next-line no-console
      console.debug('[analytics]', name, clean ?? {});
      break;
    case 'none':
      break;
  }
}

function stripUndefined(
  props?: AnalyticsProps,
): Record<string, string | number | boolean | null> | undefined {
  if (!props) return undefined;
  const out: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) out[key] = value;
  }
  return Object.keys(out).length ? out : undefined;
}
