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
import { RevealText } from "@/components/marketing/motion-primitives";
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
          <div className="aura-field absolute inset-0 animate-aura-drift opacity-70" />
          <div className="absolute left-1/2 top-[-10%] h-[640px] w-[820px] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-5%] h-[460px] w-[620px] rounded-full bg-gold/[0.05] blur-[120px]" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen blur-[2px]"
            style={{ backgroundImage: "url(/generated/hero-aura.webp)" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          {/* ── Hero ── */}
          <m.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center"
          >
            <m.span
              variants={riseIn}
              custom={0}
              className="inline-block animate-breath text-xs font-medium uppercase tracking-[0.34em] text-gold"
            >
              The house rules
            </m.span>
            <RevealText
              className="mt-5 block font-serif text-[clamp(2.25rem,7vw,3.75rem)] font-medium leading-[1.05] tracking-[-0.02em]"
              delay={0.1}
              lines={[
                { text: "How we keep", className: "text-foreground" },
                { text: "this room safe.", className: "text-gradient-brand" },
              ]}
            />
            <m.p
              variants={riseIn}
              custom={2}
              className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-text-secondary"
            >
              A few quiet rules keep the room warm, safe, and yours. Hold to
              them, and everyone breathes easier. Cross them, and you may meet a
              warning, a pause, or a closed door.
            </m.p>
            <m.p
              variants={riseIn}
              custom={3}
              className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-text-secondary/80"
            >
              Not fine print. The shape of trust we hold each other to — so
              everyone here can let their guard down.
            </m.p>
          </m.div>

          {/* ── Guidelines ── */}
          <div className="mt-24 space-y-8">
            {guidelines.map((section, sectionIndex) => (
              <AnimatedSection key={section.title}>
                <m.div
                  variants={riseInSoft}
                  custom={0}
                  className="group rounded-2xl border border-border/50 bg-surface/40 p-7 backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:bg-surface/60 sm:p-10"
                >
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 rounded-xl bg-accent-muted p-3 transition-transform duration-300 group-hover:scale-105">
                      <section.icon
                        className="h-5 w-5 text-accent"
                        weight="duotone"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3">
                        <span className="font-serif text-sm text-gold/60">
                          {String(sectionIndex + 1).padStart(2, "0")}
                        </span>
                        <h2 className="font-serif text-xl font-medium tracking-[-0.01em] text-foreground sm:text-2xl">
                          {section.title}
                        </h2>
                      </div>
                      <ul className="mt-5 space-y-3.5">
                        {section.items.map((item, itemIndex) => (
                          <m.li
                            key={itemIndex}
                            variants={riseInSoft}
                            custom={itemIndex + 1}
                            className="flex items-start gap-3.5 text-sm leading-relaxed text-text-secondary"
                          >
                            <span className="mt-[0.55em] block h-1 w-4 flex-shrink-0 rounded-full bg-gold/40" />
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

          {/* ── Prohibitions ── */}
          <AnimatedSection className="mt-24">
            <m.div
              variants={riseIn}
              custom={0}
              className="rounded-2xl border border-danger/20 bg-danger/[0.03] p-7 sm:p-10"
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 rounded-xl bg-danger/10 p-3">
                  <Prohibit className="h-5 w-5 text-danger" weight="duotone" />
                </div>
                <div className="flex-1">
                  <h2 className="font-serif text-xl font-medium tracking-[-0.01em] text-foreground sm:text-2xl">
                    Strictly Prohibited
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                    These leave no room for a second look — they close the door
                    for good.
                  </p>
                  <ul className="mt-6 space-y-3.5">
                    {prohibitions.map((item, i) => (
                      <m.li
                        key={i}
                        variants={riseInSoft}
                        custom={i + 1}
                        className="flex items-start gap-3.5 text-sm leading-relaxed text-text-secondary"
                      >
                        <Warning
                          className="mt-0.5 h-4 w-4 flex-shrink-0 text-danger"
                          weight="fill"
                        />
                        {item}
                      </m.li>
                    ))}
                  </ul>
                </div>
              </div>
            </m.div>
          </AnimatedSection>

          {/* ── Reporting ── */}
          <AnimatedSection className="mt-24">
            <m.div
              variants={riseIn}
              custom={0}
              className="relative overflow-hidden rounded-3xl border border-gold/15 bg-surface/30 px-6 py-16 text-center backdrop-blur-sm sm:px-12 sm:py-20"
            >
              <div className="aura-field absolute inset-0 opacity-40" aria-hidden />
              <div className="relative">
                <span className="inline-block text-xs font-medium uppercase tracking-[0.34em] text-gold">
                  Reporting &amp; Enforcement
                </span>
                <h2 className="mx-auto mt-5 max-w-2xl font-serif text-[clamp(1.75rem,5vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.02em] text-foreground">
                  Saw something?{" "}
                  <span className="text-gradient-brand">Felt something?</span>
                </h2>
                <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-text-secondary">
                  Reach for the in-app reporting tools, or write our safety team
                  at{" "}
                  <span className="font-medium text-gold">
                    safety@passionden.club
                  </span>
                  . Every report is read within 24 hours and kept in strict
                  confidence. We take each one to heart — this room stays safe
                  because we keep it that way, together.
                </p>
              </div>
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
