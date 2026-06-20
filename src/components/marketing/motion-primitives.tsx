"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  m,
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";

const ENTER = [0.05, 0.7, 0.1, 1] as const;

/* ------------------------------------------------------------------ */
/* RevealText — per-line masked reveal (lines rise from behind a clip). */
/* Serif headlines only. Each line is its own overflow-hidden window.   */
/* ------------------------------------------------------------------ */
type Line = { text: string; className?: string };

export function RevealText({
  lines,
  className,
  stagger = 0.11,
  delay = 0,
  once = true,
}: {
  lines: Line[];
  className?: string;
  stagger?: number;
  delay?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();

  // Self-triggering on scroll-into-view AND independent of any ancestor's
  // animate state (own initial/whileInView on a motion container).
  const lineVariants = reduce
    ? {
        hidden: { opacity: 0 },
        visible: (i: number) => ({
          opacity: 1,
          transition: { duration: 0.4, delay: delay + i * stagger },
        }),
      }
    : {
        hidden: { y: "115%" },
        visible: (i: number) => ({
          y: "0%",
          transition: { duration: 0.9, ease: ENTER, delay: delay + i * stagger },
        }),
      };

  return (
    <m.span
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-12%" }}
      aria-label={lines.map((l) => l.text).join(" ")}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]" aria-hidden>
          <m.span custom={i} variants={lineVariants} className={`block ${line.className ?? ""}`}>
            {line.text}
          </m.span>
        </span>
      ))}
    </m.span>
  );
}

/* ------------------------------------------------------------------ */
/* ParallaxLayer — an oversized image that drifts against scroll, with  */
/* an optional slow Ken-Burns push-in. Drop inside a relative frame     */
/* (overflow-hidden); overlays sit as siblings above it.                */
/* ------------------------------------------------------------------ */
export function ParallaxLayer({
  src,
  alt = "",
  sizes,
  priority = false,
  kenBurns = false,
}: {
  src: string;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  kenBurns?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-10%", "10%"]);

  return (
    <m.div ref={ref} style={{ y }} className="absolute inset-[-12%]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover object-center ${kenBurns && !reduce ? "animate-kenburns" : ""}`}
      />
    </m.div>
  );
}

/* ------------------------------------------------------------------ */
/* VelvetCursor — a soft gold ring that trails the pointer and swells   */
/* crimson over interactive elements. Desktop + fine-pointer only,      */
/* additive (never hides the native cursor), killed on reduced motion.  */
/* ------------------------------------------------------------------ */
export function VelvetCursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hot, setHot] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 450, damping: 40, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 450, damping: 40, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as Element | null;
      setHot(!!t?.closest?.("a,button,[role=button],input,label"));
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduce, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="rounded-full"
        animate={{
          width: hot ? 44 : 26,
          height: hot ? 44 : 26,
          borderColor: hot ? "rgba(194,24,91,0.9)" : "rgba(212,165,116,0.65)",
          borderWidth: hot ? 1.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        style={{ borderStyle: "solid", marginLeft: "-50%", marginTop: "-50%" }}
      />
    </motion.div>
  );
}
