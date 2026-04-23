"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  HandHeart,
  ShieldCheck,
  Eye,
  AlertTriangle,
  MessageCircle,
  Ban,
  Heart,
  Users,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function AnimatedSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
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
      'Respect the "what happens on PassionDen, stays on PassionDen" principle.',
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
    icon: MessageCircle,
    title: "Communication Standards",
    items: [
      "Be clear about your intentions and expectations.",
      "Negotiate boundaries before meeting in person or attending events.",
      "Keep conversations respectful even when declining or ending interactions.",
      "Use content warnings when sharing explicit material in shared spaces.",
    ],
  },
  {
    icon: Users,
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
    <div className="relative min-h-dvh">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/3 top-1/4 h-[400px] w-[400px] rounded-full bg-accent/[0.04] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Hero */}
        <AnimatedSection className="text-center">
          <motion.span
            variants={fadeUp}
            custom={0}
            className="inline-block text-xs font-medium uppercase tracking-widest text-gold"
          >
            Community
          </motion.span>
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mt-4 font-serif text-4xl font-bold tracking-tight sm:text-5xl"
          >
            Community <span className="text-gradient-brand">Guidelines</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary"
          >
            These guidelines exist to keep PassionDen a safe, respectful, and
            empowering space for all members. Violations may result in warnings,
            suspension, or permanent removal.
          </motion.p>
        </AnimatedSection>

        {/* Guidelines */}
        <div className="mt-16 space-y-8">
          {guidelines.map((section, sectionIndex) => (
            <AnimatedSection key={section.title}>
              <motion.div
                variants={fadeUp}
                custom={0}
                className="rounded-xl border border-border/50 bg-surface/40 p-6 backdrop-blur-sm sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-lg bg-accent-muted p-2.5">
                    <section.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-foreground">
                      {section.title}
                    </h2>
                    <ul className="mt-4 space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <motion.li
                          key={itemIndex}
                          variants={fadeUp}
                          custom={itemIndex + 1}
                          className="flex items-start gap-3 text-sm leading-relaxed text-text-secondary"
                        >
                          <span className="mt-1.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent/60" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        {/* Prohibitions */}
        <AnimatedSection className="mt-16">
          <motion.div
            variants={fadeUp}
            custom={0}
            className="rounded-xl border border-danger/20 bg-danger/[0.03] p-6 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 rounded-lg bg-danger/10 p-2.5">
                <Ban className="h-5 w-5 text-danger" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Strictly Prohibited
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  The following behaviors will result in immediate and permanent
                  removal from the platform.
                </p>
                <ul className="mt-4 space-y-3">
                  {prohibitions.map((item, i) => (
                    <motion.li
                      key={i}
                      variants={fadeUp}
                      custom={i + 1}
                      className="flex items-start gap-3 text-sm leading-relaxed text-text-secondary"
                    >
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-danger" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </AnimatedSection>

        {/* Reporting */}
        <AnimatedSection className="mt-16">
          <motion.div
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Reporting & Enforcement
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary">
              If you witness or experience a violation of these guidelines,
              please use the in-app reporting tools or contact our safety team at{" "}
              <span className="font-medium text-accent">
                safety@passionden.club
              </span>
              . All reports are reviewed within 24 hours and handled with strict
              confidentiality. We take every report seriously and are committed
              to maintaining a safe environment for all members.
            </p>
          </motion.div>
        </AnimatedSection>
      </div>
    </div>
  );
}
