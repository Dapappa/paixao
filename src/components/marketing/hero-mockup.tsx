"use client";

/**
 * Velvet Aura hero centerpiece — an autonomous, looping mockup of the real
 * Paixão product, built as REAL DOM (not video, not WebGL) so it stays crisp,
 * on-palette, and always matches the shipped app.
 *
 * Two decoupled systems (per the foundation brief):
 *   1. A time-driven state machine cycles a ~13s two-act vignette.
 *   2. Pointer + breath transforms FRAME it (3D tilt, parallax depth, glare).
 *
 * No photography — anonymous gradient personas keep the marketing surface
 * ad-safe. Honors prefers-reduced-motion by holding a single static scene.
 */

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  animate,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { Sparkle, Heart, Check, CalendarDots, CellSignalFull, WifiHigh, BatteryFull } from "@phosphor-icons/react/ssr";
import { spring, ease } from "@/lib/motion";

/* ------------------------------------------------------------------ */
/* Mock data — anonymous personas, tasteful & ad-safe                  */
/* ------------------------------------------------------------------ */

type Persona = {
  name: string;
  meta: string;
  photo: string;
  initials: string;
  from: string;
  to: string;
  desires: string[];
};

const PROFILES: Persona[] = [
  { name: "Mara", meta: "29 · Verified", photo: "/generated/real-persona-w.webp", initials: "M", from: "#d4a574", to: "#c2185b", desires: ["Candlelit dinners", "Coltrane after midnight", "Slow mornings"] },
  { name: "Léa", meta: "31 · Verified", photo: "/generated/real-persona-5.webp", initials: "L", from: "#e91e63", to: "#d4a574", desires: ["Midnight talks", "Dancing close", "Too much red"] },
  { name: "Adrien", meta: "33 · Verified", photo: "/generated/real-persona-m.webp", initials: "A", from: "#c2185b", to: "#7a1037", desires: ["Long drives", "No small talk", "Whisky neat"] },
];

const SHARED = ["Candlelit dinners", "Midnight talks"];

const SCENES = [
  { key: "match", ms: 4400 },
  { key: "reveal", ms: 4600 },
  { key: "event", ms: 5200 },
] as const;
type SceneKey = (typeof SCENES)[number]["key"];

/* ------------------------------------------------------------------ */
/* Atoms                                                               */
/* ------------------------------------------------------------------ */

function Avatar({
  from,
  to,
  initials,
  size = 56,
  ring = false,
  src,
}: {
  from: string;
  to: string;
  initials: string;
  size?: number;
  ring?: boolean;
  src?: string;
}) {
  const shadow = ring
    ? `0 0 0 2px rgba(10,10,10,0.9), 0 0 0 3.5px ${to}, 0 8px 24px -6px ${to}80`
    : "0 8px 22px -10px rgba(0,0,0,0.8)";

  if (src) {
    return (
      <div className="relative overflow-hidden rounded-full" style={{ width: size, height: size, boxShadow: shadow }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className="relative grid place-items-center rounded-full font-serif font-semibold text-black/80"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        background: `radial-gradient(120% 120% at 30% 25%, ${from}, ${to})`,
        boxShadow: shadow,
      }}
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(60% 50% at 50% 120%, rgba(0,0,0,0.45), transparent 70%)" }}
      />
      <span className="relative z-10 select-none">{initials}</span>
    </div>
  );
}

function Chip({ label, glow = false }: { label: string; glow?: boolean }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium leading-none transition-colors"
      style={{
        borderColor: glow ? "rgba(212,165,116,0.7)" : "rgba(255,255,255,0.1)",
        color: glow ? "#f0d9bf" : "rgba(245,245,245,0.62)",
        background: glow ? "rgba(212,165,116,0.12)" : "rgba(255,255,255,0.02)",
        boxShadow: glow ? "0 0 16px -2px rgba(212,165,116,0.45)" : "none",
      }}
    >
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Act 1 — matching                                                    */
/* ------------------------------------------------------------------ */

function MatchScene({ active }: { active: boolean }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!active || reduce) return;
    setI(0);
    const id = setInterval(() => setI((v) => v + 1), 1450);
    return () => clearInterval(id);
  }, [active, reduce]);

  const top = PROFILES[i % PROFILES.length];
  const next = PROFILES[(i + 1) % PROFILES.length];

  return (
    <div className="relative h-full w-full px-5 pt-14">
      <p className="mb-3 text-center font-serif text-[13px] italic text-gold/90">Tonight, near you</p>
      <div className="relative mx-auto h-[330px] w-[210px]">
        {/* card behind */}
        <Card persona={next} depth />
        <AnimatePresence>
          <m.div
            key={i}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: spring.silk }}
            exit={{
              x: 260,
              rotate: 16,
              opacity: 0,
              transition: { ...spring.allure },
            }}
          >
            <Card persona={top} stamp />
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Card({ persona, depth = false, stamp = false }: { persona: Persona; depth?: boolean; stamp?: boolean }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[22px] border border-white/10"
      style={{
        transform: depth ? "translateY(14px) scale(0.94)" : "none",
        opacity: depth ? 0.5 : 1,
        background: "#0d0d0d",
        boxShadow: "0 30px 60px -30px rgba(0,0,0,0.9)",
      }}
    >
      {/* full-bleed masked-persona photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={persona.photo} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      {/* warm grade + bottom scrim so the name reads */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(212,165,116,0.05) 0%, transparent 28%, rgba(10,10,10,0.5) 60%, #0a0a0a 100%)" }}
      />
      {stamp && (
        <m.div
          initial={{ opacity: 0, scale: 1.3, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, rotate: -12, transition: { delay: 0.9, ...spring.allure } }}
          className="absolute right-3 top-3 rounded-md border-2 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm"
          style={{ borderColor: "#d4a574", color: "#d4a574", background: "rgba(10,10,10,0.25)" }}
        >
          Allure
        </m.div>
      )}
      <div className="absolute inset-x-0 bottom-0 space-y-2 p-3.5">
        <div className="flex items-baseline justify-between">
          <span className="font-serif text-xl font-semibold text-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{persona.name}</span>
          <span className="text-[10px] text-foreground/70">{persona.meta}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {persona.desires.map((d) => (
            <Chip key={d} label={d} glow={SHARED.includes(d)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Act 1.5 — the compatibility reveal                                  */
/* ------------------------------------------------------------------ */

function RevealScene({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const pct = useMotionValue(0);
  const rounded = useTransform(pct, (v) => Math.round(v));
  const [shown, setShown] = useState(0);
  const R = 52;
  const C = 2 * Math.PI * R;
  const dash = useTransform(pct, (v) => `${(v / 100) * C} ${C}`);

  useEffect(() => {
    if (!active) return;
    if (reduce) {
      pct.set(94);
      setShown(94);
      return;
    }
    pct.set(0);
    const unsub = pct.on("change", (v) => setShown(Math.round(v)));
    const controls = animate(pct, 94, { duration: 1.6, delay: 0.4, ease: ease.enter });
    return () => {
      controls.stop();
      unsub();
    };
  }, [active, reduce, pct]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center px-6">
      <m.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.enter } }}
        className="mb-7 text-center text-xs font-medium uppercase tracking-[0.25em] text-text-secondary"
      >
        Shared Desires
      </m.p>

      {/* two converging avatars + ring */}
      <div className="relative grid place-items-center">
        <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
          <circle cx="75" cy="75" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
          <m.circle
            cx="75" cy="75" r={R} fill="none" stroke="url(#ag)" strokeWidth="6" strokeLinecap="round"
            style={{ strokeDasharray: dash }}
          />
          <defs>
            <linearGradient id="ag" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d4a574" />
              <stop offset="100%" stopColor="#c2185b" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute flex items-center gap-1.5">
          <m.div initial={{ x: 14, opacity: 0 }} animate={{ x: 0, opacity: 1, transition: spring.silk }}>
            <Avatar from="#d4a574" to="#c2185b" initials="M" size={44} ring src="/generated/real-persona-w.webp" />
          </m.div>
          <m.div initial={{ x: -14, opacity: 0 }} animate={{ x: 0, opacity: 1, transition: { ...spring.silk, delay: 0.1 } }}>
            <Avatar from="#e91e63" to="#7a1037" initials="Y" size={44} ring src="/generated/real-persona-m.webp" />
          </m.div>
        </div>
      </div>

      <div className="mt-5 flex items-baseline gap-1">
        <m.span className="font-serif text-4xl font-bold text-gradient-gold">{shown}</m.span>
        <span className="font-serif text-xl text-gold/80">%</span>
      </div>
      <p className="mt-1 text-[11px] text-text-secondary">compatibility</p>

      <div className="mt-5 flex flex-wrap justify-center gap-1.5">
        {SHARED.map((d, k) => (
          <m.div
            key={d}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, transition: { delay: 1.2 + k * 0.15, ...spring.silk } }}
          >
            <Chip label={d} glow />
          </m.div>
        ))}
      </div>

      {/* one slow gold ring-pulse — restrained, on-brand (no confetti) */}
      {active && !reduce && <RingPulse />}
    </div>
  );
}

function RingPulse() {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      {[0, 1].map((k) => (
        <m.span
          key={k}
          className="absolute rounded-full border border-gold/50"
          style={{ width: 80, height: 80 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 0.7, 0],
            scale: [0.5, 2.4, 2.8],
            transition: { duration: 2.4, delay: 1.4 + k * 0.5, ease: ease.elegant },
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Act 2 — organizing (the event snowball)                             */
/* ------------------------------------------------------------------ */

function EventScene({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(reduce ? 27 : 18);

  useEffect(() => {
    if (!active || reduce) return;
    setCount(18);
    const id = setInterval(() => setCount((c) => (c < 27 ? c + 1 : c)), 220);
    return () => clearInterval(id);
  }, [active, reduce]);

  const guests = [
    { f: "#d4a574", t: "#c2185b", i: "M", p: "/generated/real-persona-w.webp" },
    { f: "#e91e63", t: "#7a1037", i: "S", p: "/generated/real-persona-5.webp" },
    { f: "#c2185b", t: "#3a0a1c", i: "V", p: "/generated/real-persona-7.webp" },
    { f: "#d4a574", t: "#8a5a2b", i: "J", p: "/generated/real-persona-m.webp" },
    { f: "#e91e63", t: "#d4a574", i: "L", p: "/generated/real-persona-6.webp" },
  ];

  return (
    <div className="relative flex h-full w-full flex-col justify-center px-5">
      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.enter } }}
        className="overflow-hidden rounded-[20px] border border-white/10"
        style={{ background: "linear-gradient(165deg, #181012, #0c0c0c)" }}
      >
        <div
          className="relative h-28 w-full"
          style={{ background: "radial-gradient(100% 90% at 30% 0%, rgba(212,165,116,0.35), transparent 60%), radial-gradient(90% 90% at 90% 100%, rgba(194,24,91,0.4), #0c0c0c 70%)" }}
        >
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[9px] font-medium uppercase tracking-wider text-gold backdrop-blur">
            <Sparkle className="h-2.5 w-2.5" weight="fill" /> Members only
          </span>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center gap-2 text-[10px] text-text-secondary">
            <CalendarDots className="h-3 w-3 text-gold" weight="light" /> Friday · 9:00 PM · A private address
          </div>
          <h4 className="font-serif text-xl font-semibold text-foreground">Velvet Hours</h4>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-2.5">
              {guests.map((g, k) => (
                <m.div
                  key={k}
                  initial={{ opacity: 0, scale: 0.5, x: -6 }}
                  animate={active ? { opacity: 1, scale: 1, x: 0, transition: { delay: 0.4 + k * 0.12, ...spring.allure } } : {}}
                  style={{ zIndex: guests.length - k }}
                >
                  <Avatar from={g.f} to={g.t} initials={g.i} size={30} ring src={g.p} />
                </m.div>
              ))}
            </div>
            <span className="text-[11px] text-text-secondary">
              <span className="font-semibold text-foreground">{count}</span> attending
            </span>
          </div>

          <div className="mt-1 h-9 w-full rounded-full bg-gradient-to-r from-gold to-accent text-center text-[11px] font-semibold leading-9 text-black/85">
            Request to join
          </div>
        </div>
      </m.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Phone + orchestrator                                                */
/* ------------------------------------------------------------------ */

const SCENE_LABEL: Record<SceneKey, { icon: typeof Heart; label: string }> = {
  match: { icon: Heart, label: "Discover" },
  reveal: { icon: Check, label: "Connect" },
  event: { icon: CalendarDots, label: "Gather" },
};

export function HeroMockup() {
  return (
    <LazyMotion features={domAnimation}>
      <HeroMockupInner />
    </LazyMotion>
  );
}

function HeroMockupInner() {
  const reduce = useReducedMotion();
  const [scene, setScene] = useState<SceneKey>("match");

  // Scene 1 of the state machine: advance through the two-act vignette.
  useEffect(() => {
    if (reduce) {
      setScene("reveal");
      return;
    }
    let idx = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      timer = setTimeout(() => {
        idx = (idx + 1) % SCENES.length;
        setScene(SCENES[idx].key);
        tick();
      }, SCENES[idx].ms);
    };
    tick();
    return () => clearTimeout(timer);
  }, [reduce]);

  // Scene 2: pointer tilt + parallax. Inner layers read --rx/--ry/--gx/--gy.
  const rx = useSpring(useMotionValue(0), spring.silk);
  const ry = useSpring(useMotionValue(0), spring.silk);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(40);
  const stageRef = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent) {
    if (reduce) return;
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 16);
    rx.set(-py * 16);
    glareX.set(50 + px * 60);
    glareY.set(40 + py * 60);
  }
  function onLeave() {
    rx.set(0);
    ry.set(0);
    glareX.set(50);
    glareY.set(40);
  }

  const glare = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(40% 40% at ${x}% ${y}%, rgba(255,255,255,0.10), transparent 70%)`,
  );

  const Active = SCENE_LABEL[scene];

  return (
    <div
      ref={stageRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative mx-auto"
      style={{ perspective: 1200, width: 300 }}
    >
      <m.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="relative"
        animate={reduce ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: ease.elegant }}
      >
        {/* aura cast on the floor behind the phone */}
        <div
          className="absolute -inset-16 -z-10 rounded-full blur-3xl"
          style={{ background: "radial-gradient(50% 50% at 50% 55%, rgba(194,24,91,0.5), rgba(212,165,116,0.18), transparent 72%)", transform: "translateZ(-120px)" }}
        />

        {/* phone shell */}
        <div
          className="relative h-[620px] w-[300px] overflow-hidden rounded-[44px] border border-white/12"
          style={{
            background: "linear-gradient(160deg, #1c1c1c, #050505)",
            boxShadow: "0 50px 90px -30px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.08)",
            transform: "translateZ(40px)",
          }}
        >
          {/* notch */}
          <div className="absolute left-1/2 top-2.5 z-30 h-6 w-28 -translate-x-1/2 rounded-full bg-black" />

          {/* screen */}
          <div className="absolute inset-[6px] overflow-hidden rounded-[38px] bg-background">
            {/* in-screen aura */}
            <div className="aura-field pointer-events-none absolute inset-0 animate-aura-drift opacity-80" />
            <m.div className="pointer-events-none absolute inset-0 z-20" style={{ background: glare }} />

            {/* status bar */}
            <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-7 pt-3.5 text-[11px] font-semibold text-foreground/85">
              <span className="tabular-nums">9:41</span>
              <div className="flex items-center gap-1.5">
                <CellSignalFull className="h-3 w-3" weight="fill" />
                <WifiHigh className="h-3 w-3" weight="fill" />
                <BatteryFull className="h-4 w-4" weight="fill" />
              </div>
            </div>

            {/* scenes */}
            <div className="absolute inset-0 z-10">
              <AnimatePresence mode="wait">
                <m.div
                  key={scene}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1, transition: { duration: 0.5, ease: ease.enter } }}
                  exit={{ opacity: 0, scale: 0.99, transition: { duration: 0.3, ease: ease.exit } }}
                >
                  {scene === "match" && <MatchScene active={scene === "match"} />}
                  {scene === "reveal" && <RevealScene active={scene === "reveal"} />}
                  {scene === "event" && <EventScene active={scene === "event"} />}
                </m.div>
              </AnimatePresence>
            </div>

            {/* bottom nav */}
            <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-white/8 bg-background/80 px-4 pb-5 pt-3 backdrop-blur-xl">
              {(Object.keys(SCENE_LABEL) as SceneKey[]).map((k) => {
                const Item = SCENE_LABEL[k];
                const on = k === scene;
                return (
                  <div key={k} className="flex flex-col items-center gap-1">
                    <Item.icon className="h-4 w-4" weight={on ? "fill" : "light"} style={{ color: on ? "#d4a574" : "rgba(245,245,245,0.35)" }} />
                    <span className="text-[8px]" style={{ color: on ? "#d4a574" : "rgba(245,245,245,0.3)" }}>
                      {Item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* floating live badge */}
        <m.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, transition: { delay: 0.6, ...spring.silk } }}
          className="absolute -right-4 top-24 z-40 flex items-center gap-1.5 rounded-full border border-white/12 bg-surface/90 px-3 py-1.5 backdrop-blur-xl"
          style={{ transform: "translateZ(90px)", boxShadow: "0 0 24px -6px rgba(212,165,116,0.5)" }}
        >
          <Active.icon className="h-3 w-3 text-gold" weight="fill" />
          <span className="text-[10px] font-medium text-foreground">{Active.label}</span>
        </m.div>
      </m.div>
    </div>
  );
}
