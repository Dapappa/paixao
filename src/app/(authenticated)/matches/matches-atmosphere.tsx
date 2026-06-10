"use client";

import Image from "next/image";

/* ─────────────────────────────────────────────
   MatchesAtmosphere — the distinct "petals" mood
   layer for the whole matching surface. A soft
   velvet-petal backdrop under an aura field, with
   film grain + vignette so content stays legible.
   Presentation only — no logic, no data.
   ───────────────────────────────────────────── */

export function MatchesAtmosphere({
  src = "/generated/bg-petals.webp",
}: {
  src?: string;
}) {
  return (
    <>
      {/* fixed mood layer, behind everything, non-interactive */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        {/* assigned section background — low-opacity, masked to near-black */}
        <Image
          src={src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-[0.22]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
        {/* warm petal-bloom focal glows */}
        <div className="aura-field absolute inset-0 animate-aura-drift opacity-60" />
        <div className="absolute left-1/2 top-[-12%] h-[560px] w-[760px] -translate-x-1/2 rounded-full bg-accent/[0.06] blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-8%] h-[440px] w-[600px] rounded-full bg-gold/[0.05] blur-[130px]" />
      </div>

      {/* atmosphere overlays (fixed, non-interactive) */}
      <div className="vignette" aria-hidden />
      <div className="film-grain" aria-hidden />
    </>
  );
}
