import type { NextConfig } from "next";

// Security headers applied to every response. Kept conservative so they don't
// break Stripe Checkout redirects, Supabase requests, or the OG/PWA routes.
// A strict Content-Security-Policy is intentionally omitted for now — it needs
// per-domain allowlisting (Stripe, Supabase) and nonce wiring before it can be
// enabled without breaking the app.
const securityHeaders = [
  {
    // Opt every page out of being framed (clickjacking protection).
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Lock down powerful browser features we don't use.
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    // HSTS — only meaningful over HTTPS (Vercel/prod), harmless locally.
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // three.js ships untranspiled ESM; Next must transpile it for the R3F
  // ambient backdrop (Velvet Aura) to build under Turbopack.
  transpilePackages: ["three"],
  experimental: {
    // React <ViewTransition> integration for shared-element route morphs
    // (match-card → profile, event-card → event-detail). See AGENTS.md.
    viewTransition: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
