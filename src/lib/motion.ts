import type { Transition, Variants } from "motion/react";

/**
 * Velvet Aura motion language — the single source of truth for how Paixão moves.
 * Mirrors the CSS `--ease-*` / `--animate-*` tokens in globals.css.
 *
 * Philosophy: nothing eases linearly, nothing pops. Motion has a body-derived
 * baseline (breath/heartbeat) and resolves on critically-damped "silk" springs.
 * Generic fade-ups are banned — entrances rise on `ease.enter`.
 */

/* Cubic-bezier easings (Material/Apple-derived). Use for tween transitions. */
export const ease = {
  /** decelerate-in — the default for elements entering the stage */
  enter: [0.05, 0.7, 0.1, 1],
  /** accelerate-out — elements leaving */
  exit: [0.3, 0, 1, 1],
  /** symmetric standard — in-place state changes */
  standard: [0.2, 0, 0, 1],
  /** elegant — slow, refined; the breath/heartbeat baseline */
  elegant: [0.4, 0, 0.2, 1],
} as const;

/* Durations in seconds. UI stays < 0.3s; 0.4–0.8s reserved for hero moments. */
export const duration = {
  fast: 0.1,
  base: 0.2,
  slow: 0.3,
  deliberate: 0.4,
  cinematic: 0.6,
  hero: 0.8,
} as const;

/**
 * Springs. `silk` handles ~99% of UI — a critically-damped, no-overshoot glide.
 * `allure` is reserved for gesture/drag releases (swiping a match card) where a
 * little overshoot rewards the momentum.
 */
export const spring = {
  silk: { type: "spring", stiffness: 200, damping: 30, mass: 1 },
  allure: { type: "spring", stiffness: 300, damping: 18, mass: 1 },
} as const satisfies Record<string, Transition>;

/* The living baseline as a JS transition (for motion components that can't use
   the CSS `animate-breath` utility, e.g. when value-driven). */
export const breath: Transition = {
  duration: 5,
  repeat: Infinity,
  ease: ease.elegant,
};

/* ------------------------------------------------------------------ */
/* Reusable variants                                                   */
/* ------------------------------------------------------------------ */

/** Rise + fade entrance. `custom` = index for stagger delay. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.09, duration: duration.cinematic, ease: ease.enter },
  }),
};

/** A softer, smaller rise for dense groups (cards, chips). */
export const riseInSoft: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: duration.deliberate, ease: ease.enter },
  }),
};

/** Parent orchestrator — one well-choreographed staggered page load. */
export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

/** Tight stagger for child clusters (never more than ~8 before a group fade). */
export const staggerTight: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

/** Scale-fade for modals / focal reveals (compatibility ring, confetti seed). */
export const bloom: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: spring.silk },
  exit: { opacity: 0, scale: 0.96, transition: { duration: duration.base, ease: ease.exit } },
};

/** Standard viewport-reveal config for `whileInView`. */
export const inView = { once: true, margin: "-80px" } as const;
