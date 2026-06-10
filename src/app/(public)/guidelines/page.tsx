"use client";

import { useRef } from "react";
import { LazyMotion, domAnimation, m, useInView } from "motion/react";
import {
  HandHeart,
  ShieldCheck,
  Eye,
  Warning,
  ChatCircle,
  Prohibit,
  Heart,
  UsersThree,
} from "@phosphor-icons/react/ssr";
import { riseIn, riseInSoft, stagger, inView } from "@/lib/motion";

function AnimatedSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, inView);
  return (
    <m.div
      ref={ref}
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </m.div>
  );
}

const guidelines = [
  {
    icon: HandHeart,
    title: "Consent is Mandatory",
    items: [
      "Always obtain explicit consent before initiating any interaction.",
      'Consent can be withdrawn at any time. "No" means no — always.',
      "Do not pressure, coerce, or guilt anyone into any activity.",
      "Respect stated boundaries without question or negotiation.",
    ],
  },
  {
    icon: Heart,
    title: "Treat Everyone with Respect",
    items: [
      "Engage with kindness, empathy, and an open mind.",
      "Discrimination based on race, gender, orientation, body type, or any other characteristic will not be tolerated.",
      "Harassment, bullying, and hate speech result in immediate removal.",
      "Constructive communication is expected at all times.",
    ],
  },
  {
    icon: Eye,
    title: "Protect Anonymity",
    items: [
      "Never attempt to discover or share another member's real identity.",
      "Do not screenshot, record, or share content from private interactions.",
      'Respect the "what happens on Paixão, stays on Paixão" principle.',
      "Report any attempts at doxxing immediately.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Safety & Verification",
    items: [
      "All members must be verified as 18 years of age or older.",
      "Do not create fake profiles or impersonate others.",
      "Report suspicious activity, underage users, or potential threats immediately.",
      "Use the safety tools provided — safe words, block features, and panic buttons.",
    ],
  },
  {
    icon: ChatCircle,
    title: "Communication Standards",
    items: [
      "Be clear about your intentions and expectations.",
      "Negotiate boundaries before meeting in person or attending events.",
      "Keep conversations respectful even when declining or ending interactions.",
      "Use content warnings when sharing explicit material in shared spaces.",
    ],
  },
  {
    icon: UsersThree,
    title: "Event Etiquette",
    items: [
      "Follow all event-specific rules set by organizers.",
      "Respect the dress code and conduct standards of each venue.",
      "Ask before approaching anyone — read the room.",
      "Look out for fellow members — if you see something, say something.",
    ],
  },
];

const prohibitions = [
  "Non-consensual sharing of intimate images or content",
  "Solicitation of minors or anyone under 18",
  "Commercial solicitation, spam, or unsolicited advertising",
  "Distribution of illegal substances or services",
  "Stalking, doxxing, or real-world harassment",
  "Impersonation of other members or staff",
  "Attempts to circumvent safety features or verification",
];

export default function GuidelinesPage() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="relative min-h-dvh overflow-hidden bg-background">
        {/* ── Ambient aura backdrop (Velvet Aura) ── */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="aura-field absolute inset-0 animate-aura-drift opacity-60" />
          <div className="absolute left-1/3 top-[12%] h-[480px] w-[560px] -translate-x-1/3 rounded-full bg-accent/[0.06] blur-[130px]" />
          <div className="absolute bottom-[-8%] right-[-6%] h-[420px] w-[520px] rounded-full bg-gold/[0.04] blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          {/* Hero */}
          <m.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center"
          >
            <m.span
              variants={riseIn}
              custom={0}
              className="inline-block animate-breath font-serif text-xs font-medium uppercase tracking-[0.34em] text-gold"
            >
              The house rules
            </m.span>
            <m.h1
              variants={riseIn}
              custom={1}
              className="mt-5 font-serif text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl"
            >
              Community <span className="text-gradient-brand">Guidelines</span>
            </m.h1>
            <m.p
              variants={riseIn}
              custom={2}
              className="mx-auto mt-6 max-w-2xl text-lg leading-[1.65] text-text-secondary"
            >
              A few quiet rules keep the room warm, safe, and yours. Hold to
              them, and everyone breathes easier. Cross them, and you may meet a
              warning, a pause, or a closed door.
            </m.p>
          </m.div>

          {/* Guidelines */}
          <div className="mt-16 space-y-8">
            {guidelines.map((section) => (
              <AnimatedSection key={section.title}>
                <m.div
                  variants={riseInSoft}
                  custom={0}
                  className="rounded-2xl border border-border/50 bg-surface/40 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-accent/30 sm:p-8"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 rounded-lg bg-accent-muted p-2.5">
                      <section.icon className="h-5 w-5 text-accent" weight="duotone" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-serif text-xl font-semibold text-foreground">
                        {section.title}
                      </h2>
                      <ul className="mt-4 space-y-3">
                        {section.items.map((item, itemIndex) => (
                          <m.li
                            key={itemIndex}
                            variants={riseInSoft}
                            custom={itemIndex + 1}
                            className="flex items-start gap-3 text-sm leading-[1.65] text-text-secondary"
                          >
                            <span className="mt-1.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold/70" />
                            {item}
                          </m.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </m.div>
              </AnimatedSection>
            ))}
          </div>

          {/* Prohibitions */}
          <AnimatedSection className="mt-16">
            <m.div
              variants={riseIn}
              custom={0}
              className="rounded-2xl border border-danger/20 bg-danger/[0.03] p-6 sm:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-lg bg-danger/10 p-2.5">
                  <Prohibit className="h-5 w-5 text-danger" weight="duotone" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-semibold text-foreground">
                    Strictly Prohibited
                  </h2>
                  <p className="mt-2 text-sm leading-[1.65] text-text-secondary">
                    These leave no room for a second look — they close the door
                    for good.
                  </p>
                  <ul className="mt-4 space-y-3">
                    {prohibitions.map((item, i) => (
                      <m.li
                        key={i}
                        variants={riseInSoft}
                        custom={i + 1}
                        className="flex items-start gap-3 text-sm leading-[1.65] text-text-secondary"
                      >
                        <Warning className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-danger" weight="fill" />
                        {item}
                      </m.li>
                    ))}
                  </ul>
                </div>
              </div>
            </m.div>
          </AnimatedSection>

          {/* Reporting */}
          <AnimatedSection className="mt-16">
            <m.div variants={riseIn} custom={0} className="text-center">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Reporting &amp; Enforcement
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-[1.65] text-text-secondary">
                Saw something? Felt something? Reach for the in-app reporting
                tools, or write our safety team at{" "}
                <span className="font-medium text-accent">
                  safety@passionden.club
                </span>
                . Every report is read within 24 hours and kept in strict
                confidence. We take each one to heart — this room stays safe
                because we keep it that way, together.
              </p>
            </m.div>
          </AnimatedSection>
        </div>

        {/* ── Atmosphere overlays (fixed, non-interactive) ── */}
        <div className="vignette" aria-hidden />
        <div className="film-grain" aria-hidden />
      </div>
    </LazyMotion>
  );
}
