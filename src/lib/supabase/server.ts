import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

/**
 * Server-side Supabase client for use in Server Components, Route Handlers,
 * and Server Actions.
 *
 * MUST be called inside a request context (never at module scope).
 * A fresh client is created per request — never cache or share across requests.
 *
 * The `setAll` handler writes refreshed auth tokens back via `cookies().set()`.
 * If a token refresh happens after the response is committed the cookies cannot
 * be set, which is expected — the middleware client handles that path.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          } catch {
            // `setAll` can be called from Server Components where cookies
            // are read-only. The middleware Supabase client handles token
            // refreshes in that case, so swallowing the error is safe.
          }
        },
      },
    },
  )
}
