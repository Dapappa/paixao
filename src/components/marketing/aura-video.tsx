"use client";

import { useReducedMotion } from "motion/react";

/**
 * The living aura — a seamless Veo 3.1 loop behind the hero. Autoplays muted &
 * looped; under prefers-reduced-motion it collapses to the static webp poster
 * (the no-motion / no-bandwidth fallback). Purely decorative.
 */
export function AuraVideo({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div
        aria-hidden
        className={className}
        style={{
          backgroundImage: "url(/generated/aura-abstract.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    );
  }

  return (
    <video
      aria-hidden
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="/generated/aura-abstract.webp"
    >
      <source src="/generated/vid-hero-aura.mp4" type="video/mp4" />
    </video>
  );
}
