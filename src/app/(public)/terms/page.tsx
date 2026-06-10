"use client";

import { useRef } from "react";
import { LazyMotion, domAnimation, m, useInView } from "motion/react";
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
    <m.section
      ref={ref}
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </m.section>
  );
}

const terms = [
  {
    title: "1. Acceptance of Terms",
    body: (
      <>
        By accessing or using Paixão (&quot;the Platform&quot;), you agree to be
        bound by these Terms of Service. If you do not agree, you may not use the
        Platform. The Platform is intended exclusively for individuals who are at
        least 18 years of age.
      </>
    ),
  },
  {
    title: "2. Eligibility",
    body: (
      <>
        You must be at least 18 years old to create an account or use the
        Platform. By registering, you represent and warrant that you meet this
        age requirement and that all information you provide is accurate and
        truthful.
      </>
    ),
  },
  {
    title: "3. Account Responsibilities",
    body: (
      <>
        You are responsible for maintaining the confidentiality of your account
        credentials and for all activities that occur under your account. You
        agree to notify us immediately of any unauthorized use. Paixão reserves
        the right to suspend or terminate accounts that violate these terms.
      </>
    ),
  },
  {
    title: "4. User Conduct",
    body: (
      <>
        You agree to use the Platform in compliance with all applicable laws and
        our Community Guidelines. You will not engage in harassment, distribute
        non-consensual content, impersonate others, or use the Platform for any
        illegal purpose. Violations may result in immediate account termination.
      </>
    ),
  },
  {
    title: "5. Content & Intellectual Property",
    body: (
      <>
        You retain ownership of content you create and share on the Platform. By
        posting content, you grant Paixão a limited, non-exclusive license to
        display and distribute that content within the Platform for operational
        purposes. You may not reproduce, distribute, or create derivative works
        from other users&apos; content without their explicit consent.
      </>
    ),
  },
  {
    title: "6. Consent & Safety",
    body: (
      <>
        All interactions on the Platform must be consensual. The Platform
        provides tools for setting boundaries, blocking users, and reporting
        violations. Use of these tools is encouraged and protected. Paixão is
        committed to cooperating with law enforcement when required by law.
      </>
    ),
  },
  {
    title: "7. Limitation of Liability",
    body: (
      <>
        The Platform is provided &quot;as is&quot; without warranties of any
        kind. Paixão shall not be liable for any indirect, incidental, special,
        or consequential damages arising from your use of the Platform. Your use
        of the Platform is at your own risk.
      </>
    ),
  },
  {
    title: "8. Modifications",
    body: (
      <>
        We reserve the right to modify these Terms at any time. We will notify
        users of significant changes via email or in-platform notification.
        Continued use after changes constitutes acceptance of the revised Terms.
      </>
    ),
  },
];

const privacy = [
  {
    title: "1. Information We Collect",
    body: (
      <>
        We collect information you provide during registration (email address,
        password), profile information you choose to share, usage data (pages
        visited, features used), and technical data (device type, IP address,
        browser). We do not require or store your real name.
      </>
    ),
  },
  {
    title: "2. How We Use Your Information",
    body: (
      <>
        Your information is used to provide and improve the Platform, verify your
        identity and age, facilitate connections and event participation, ensure
        safety and enforce our guidelines, and communicate important updates. We
        never sell your personal data to third parties.
      </>
    ),
  },
  {
    title: "3. Data Security",
    body: (
      <>
        We employ industry-standard encryption, secure server infrastructure,
        and regular security audits to protect your data. All communications are
        encrypted in transit and at rest. However, no system is completely
        secure, and we cannot guarantee absolute security.
      </>
    ),
  },
  {
    title: "4. Anonymity & Data Sharing",
    body: (
      <>
        Your anonymity is paramount. We will never share your identity with other
        users without your explicit consent. We may share anonymized, aggregated
        data for analytical purposes. We will comply with valid legal requests
        for user data as required by law, and will notify affected users when
        legally permitted to do so.
      </>
    ),
  },
  {
    title: "5. Data Retention & Deletion",
    body: (
      <>
        You may request deletion of your account and associated data at any time.
        Upon account deletion, your personal data will be permanently removed
        within 30 days. Some anonymized data may be retained for legal and
        operational purposes.
      </>
    ),
  },
  {
    title: "6. Cookies & Tracking",
    body: (
      <>
        We use essential cookies for authentication and session management. We do
        not use third-party tracking cookies or advertising networks. The age
        verification cookie (&quot;passionden_age_verified&quot;) is stored for
        30 days.
      </>
    ),
  },
  {
    title: "7. Your Rights",
    body: (
      <>
        You have the right to access, correct, or delete your personal data;
        object to or restrict processing of your data; receive a copy of your
        data in a portable format; and withdraw consent at any time. To exercise
        these rights, contact us at{" "}
        <span className="font-medium text-accent">privacy@passionden.club</span>.
      </>
    ),
  },
  {
    title: "8. Contact",
    body: (
      <>
        For questions about these policies or your data, please contact our
        privacy team at{" "}
        <span className="font-medium text-accent">privacy@passionden.club</span>.
      </>
    ),
  },
];

function LegalClause({
  title,
  body,
  index,
}: {
  title: string;
  body: React.ReactNode;
  index: number;
}) {
  return (
    <m.div variants={riseInSoft} custom={index} className="relative pl-5">
      {/* gold section marker */}
      <span className="absolute left-0 top-1.5 block h-3 w-px bg-gradient-to-b from-gold/80 to-transparent" />
      <h3 className="mb-3 font-serif text-base font-semibold text-foreground">
        {title}
      </h3>
      <p className="leading-[1.65]">{body}</p>
    </m.div>
  );
}

export default function TermsPage() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="relative min-h-dvh overflow-hidden bg-background">
        {/* ── Ambient aura backdrop (Velvet Aura) ── */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="aura-field absolute inset-0 animate-aura-drift opacity-50" />
          <div className="absolute left-1/3 top-[14%] h-[380px] w-[460px] -translate-x-1/3 rounded-full bg-accent/[0.04] blur-[120px]" />
          <div className="absolute bottom-[-6%] right-[-6%] h-[360px] w-[440px] rounded-full bg-gold/[0.03] blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          {/* Header */}
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
              The fine print, kept honest
            </m.span>
            <m.h1
              variants={riseIn}
              custom={1}
              className="mt-5 font-serif text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl"
            >
              Terms <span className="text-gradient-brand">&amp; Privacy</span>
            </m.h1>
            <m.p
              variants={riseIn}
              custom={2}
              className="mx-auto mt-5 max-w-2xl text-sm leading-[1.65] text-text-secondary"
            >
              Last updated: April 15, 2026
            </m.p>
          </m.div>

          {/* Content */}
          <div className="mt-16 space-y-12">
            {/* Terms of Service */}
            <AnimatedSection className="rounded-2xl border border-border/50 bg-surface/40 p-6 backdrop-blur-sm sm:p-10">
              <m.h2
                variants={riseIn}
                custom={0}
                className="font-serif text-2xl font-bold text-foreground"
              >
                Terms of Service
              </m.h2>
              <div className="mt-8 space-y-8 text-sm leading-[1.65] text-text-secondary">
                {terms.map((clause, i) => (
                  <LegalClause
                    key={clause.title}
                    title={clause.title}
                    body={clause.body}
                    index={i + 1}
                  />
                ))}
              </div>
            </AnimatedSection>

            {/* Privacy Policy */}
            <AnimatedSection className="rounded-2xl border border-border/50 bg-surface/40 p-6 backdrop-blur-sm sm:p-10">
              <m.h2
                variants={riseIn}
                custom={0}
                className="font-serif text-2xl font-bold text-foreground"
              >
                Privacy Policy
              </m.h2>
              <div className="mt-8 space-y-8 text-sm leading-[1.65] text-text-secondary">
                {privacy.map((clause, i) => (
                  <LegalClause
                    key={clause.title}
                    title={clause.title}
                    body={clause.body}
                    index={i + 1}
                  />
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* ── Atmosphere overlays (fixed, non-interactive) ── */}
        <div className="vignette" aria-hidden />
        <div className="film-grain" aria-hidden />
      </div>
    </LazyMotion>
  );
}
