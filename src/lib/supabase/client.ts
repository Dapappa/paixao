import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

/**
 * Browser-side Supabase client (singleton).
 *
 * Uses `isSingleton: true` so every call returns the same instance — this
 * avoids duplicate GoTrue subscriptions and WebSocket connections in React
 * strict-mode / hot-reload scenarios.
 *
 * Safe to call from Client Components, browser-side hooks, and event handlers.
 * NEVER import this file in Server Components or Route Handlers.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { isSingleton: true },
  )
}
