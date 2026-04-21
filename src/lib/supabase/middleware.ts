import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './types'

/**
 * Creates a Supabase client suitable for Next.js middleware.
 *
 * Unlike the server.ts client (which uses `next/headers` cookies), this one
 * reads from the incoming `NextRequest` and writes to a mutable
 * `NextResponse`. This is the only place where auth-token refreshes can
 * reliably set cookies on every request — including for Server Components
 * where `cookies().set()` is a no-op.
 *
 * Returns both the Supabase client and the response object so the caller
 * can continue decorating the response before returning it.
 */
export function createMiddlewareClient(request: NextRequest) {
  // Start with a pass-through response that forwards the original headers.
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          // 1. Mirror cookies onto the request so downstream Server Components
          //    see the refreshed values when they call `cookies()`.
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value)
          }

          // 2. Re-create the response so it carries the updated request cookies.
          response = NextResponse.next({ request })

          // 3. Write every cookie onto the outgoing response.
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }

          // 4. Apply cache-control headers from Supabase to prevent CDN caching
          //    of responses that carry auth cookies.
          if (headers) {
            for (const [key, val] of Object.entries(headers)) {
              response.headers.set(key, val)
            }
          }
        },
      },
    },
  )

  return { supabase, response: () => response }
}
