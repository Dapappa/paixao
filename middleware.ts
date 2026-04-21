import { type NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

// ---------------------------------------------------------------------------
// Routes & patterns
// ---------------------------------------------------------------------------

/** Paths that must be reachable without the age-verification cookie. */
const AGE_GATE_BYPASS = new Set(['/age-gate'])

/** Prefixes that skip ALL middleware gates (static assets, API, internals). */
const SKIP_PREFIXES = ['/_next', '/api', '/favicon.ico']

/** File-extension pattern for static assets served from /public. */
const STATIC_ASSET_RE = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot|mp4|webm)$/i

/** Routes that are public and don't require authentication. */
const PUBLIC_ROUTES = new Set([
  '/',
  '/age-gate',
  '/about',
  '/guidelines',
  '/terms',
])

/** Prefix check for auth pages (/auth/login, /auth/register, etc.). */
const AUTH_PREFIX = '/auth'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shouldSkip(pathname: string): boolean {
  return (
    SKIP_PREFIXES.some((p) => pathname.startsWith(p)) ||
    STATIC_ASSET_RE.test(pathname)
  )
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.has(pathname) || pathname.startsWith(AUTH_PREFIX)
}

/**
 * Extract the route-group segment from the pathname.
 * E.g. "/(authenticated)/dashboard" → "authenticated"
 *      "/(admin)/users"             → "admin"
 *
 * Next.js strips route-group parentheses from the URL, so we match on the
 * first real segment instead. We rely on folder naming conventions:
 *   - /dashboard, /profile, /settings, /events, /messages … → authenticated
 *   - /admin/* → admin
 */
function isAuthenticatedRoute(pathname: string): boolean {
  // Everything that isn't public, isn't admin, and isn't skipped is treated
  // as an authenticated route.
  return !isPublicRoute(pathname) && !pathname.startsWith('/admin')
}

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin')
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Fast exit for assets / internals
  if (shouldSkip(pathname)) {
    return NextResponse.next()
  }

  // -----------------------------------------------------------------------
  // Gate 1 — Age verification
  // -----------------------------------------------------------------------
  const ageVerified = request.cookies.get('paixao_age_verified')

  if (!ageVerified && !AGE_GATE_BYPASS.has(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/age-gate'
    return NextResponse.redirect(url)
  }

  // -----------------------------------------------------------------------
  // Gate 2 — Supabase session refresh
  // -----------------------------------------------------------------------
  const { supabase, response } = createMiddlewareClient(request)

  // Calling getUser() triggers a token refresh when the JWT is near expiry.
  // We intentionally use getUser() over getSession() because it verifies the
  // token with the Supabase Auth server — getSession() only reads from the
  // cookie without validation.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // -----------------------------------------------------------------------
  // Gate 3 — Route protection
  // -----------------------------------------------------------------------

  // 3a. Authenticated routes require a valid session.
  if (isAuthenticatedRoute(pathname) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    // Preserve the intended destination so we can redirect back after login.
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // 3b. Admin routes require a session AND the 'admin' role.
  if (isAdminRoute(pathname)) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    // Check for admin role in the user's app_metadata (set via service-role
    // client or Supabase dashboard). This is tamper-proof because
    // app_metadata can only be modified server-side.
    const role = user.app_metadata?.role as string | undefined
    if (role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // All gates passed — return the (possibly cookie-updated) response.
  return response()
}

// ---------------------------------------------------------------------------
// Matcher — run on all routes except Next.js internals and static files
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image  (image optimization)
     * - favicon.ico  (favicon)
     * - public folder assets with common extensions
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot|mp4|webm)$).*)',
  ],
}
