import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#0a0a0a] px-4 text-center">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c2185b]/[0.06] blur-[120px]" />
      </div>

      {/* 404 number */}
      <div className="relative">
        <span className="font-serif text-[120px] font-bold leading-none tracking-tight text-white/[0.04] sm:text-[180px]">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif text-6xl font-bold tracking-tight text-[#c2185b] sm:text-8xl">
            404
          </span>
        </div>
      </div>

      {/* Copy */}
      <h1 className="mt-6 font-serif text-2xl font-semibold tracking-wide text-white sm:text-3xl">
        Lost in the dark?
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s guide you back to familiar ground.
      </p>

      {/* CTA */}
      <Link
        href="/dashboard"
        className="mt-8 inline-flex items-center gap-2 rounded-lg border border-[#c2185b]/30 bg-[#c2185b]/10 px-6 py-3 text-sm font-medium text-[#c2185b] transition-all hover:border-[#c2185b]/50 hover:bg-[#c2185b]/20"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        Back to Dashboard
      </Link>

      {/* Brand */}
      <p className="mt-16 font-serif text-xs tracking-[0.2em] text-zinc-600">
        PASSION<span className="text-[#c2185b]/60">D</span>EN
      </p>
    </div>
  );
}
