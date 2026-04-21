"use client";

import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};

export default function TermsPage() {
  return (
    <div className="relative min-h-dvh">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/3 top-1/4 h-[300px] w-[300px] rounded-full bg-accent/[0.03] blur-[80px]" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative z-10 mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
      >
        {/* Header */}
        <div className="text-center">
          <span className="inline-block text-xs font-medium uppercase tracking-widest text-gold">
            Legal
          </span>
          <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            Terms & Privacy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-text-secondary">
            Last updated: April 15, 2026
          </p>
        </div>

        {/* Content */}
        <div className="mt-16 space-y-12">
          {/* Terms of Service */}
          <section className="rounded-xl border border-border/50 bg-surface/40 p-6 backdrop-blur-sm sm:p-10">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Terms of Service
            </h2>

            <div className="mt-8 space-y-8 text-sm leading-relaxed text-text-secondary">
              <div>
                <h3 className="mb-3 text-base font-semibold text-foreground">
                  1. Acceptance of Terms
                </h3>
                <p>
                  By accessing or using Paixao (&quot;the Platform&quot;), you
                  agree to be bound by these Terms of Service. If you do not
                  agree, you may not use the Platform. The Platform is intended
                  exclusively for individuals who are at least 18 years of age.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold text-foreground">
                  2. Eligibility
                </h3>
                <p>
                  You must be at least 18 years old to create an account or use
                  the Platform. By registering, you represent and warrant that
                  you meet this age requirement and that all information you
                  provide is accurate and truthful.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold text-foreground">
                  3. Account Responsibilities
                </h3>
                <p>
                  You are responsible for maintaining the confidentiality of your
                  account credentials and for all activities that occur under
                  your account. You agree to notify us immediately of any
                  unauthorized use. Paixao reserves the right to suspend or
                  terminate accounts that violate these terms.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold text-foreground">
                  4. User Conduct
                </h3>
                <p>
                  You agree to use the Platform in compliance with all applicable
                  laws and our Community Guidelines. You will not engage in
                  harassment, distribute non-consensual content, impersonate
                  others, or use the Platform for any illegal purpose. Violations
                  may result in immediate account termination.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold text-foreground">
                  5. Content & Intellectual Property
                </h3>
                <p>
                  You retain ownership of content you create and share on the
                  Platform. By posting content, you grant Paixao a limited,
                  non-exclusive license to display and distribute that content
                  within the Platform for operational purposes. You may not
                  reproduce, distribute, or create derivative works from other
                  users&apos; content without their explicit consent.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold text-foreground">
                  6. Consent & Safety
                </h3>
                <p>
                  All interactions on the Platform must be consensual. The
                  Platform provides tools for setting boundaries, blocking users,
                  and reporting violations. Use of these tools is encouraged and
                  protected. Paixao is committed to cooperating with law
                  enforcement when required by law.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold text-foreground">
                  7. Limitation of Liability
                </h3>
                <p>
                  The Platform is provided &quot;as is&quot; without warranties
                  of any kind. Paixao shall not be liable for any indirect,
                  incidental, special, or consequential damages arising from your
                  use of the Platform. Your use of the Platform is at your own
                  risk.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold text-foreground">
                  8. Modifications
                </h3>
                <p>
                  We reserve the right to modify these Terms at any time. We
                  will notify users of significant changes via email or
                  in-platform notification. Continued use after changes
                  constitutes acceptance of the revised Terms.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy Policy */}
          <section className="rounded-xl border border-border/50 bg-surface/40 p-6 backdrop-blur-sm sm:p-10">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Privacy Policy
            </h2>

            <div className="mt-8 space-y-8 text-sm leading-relaxed text-text-secondary">
              <div>
                <h3 className="mb-3 text-base font-semibold text-foreground">
                  1. Information We Collect
                </h3>
                <p>
                  We collect information you provide during registration (email
                  address, password), profile information you choose to share,
                  usage data (pages visited, features used), and technical data
                  (device type, IP address, browser). We do not require or store
                  your real name.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold text-foreground">
                  2. How We Use Your Information
                </h3>
                <p>
                  Your information is used to provide and improve the Platform,
                  verify your identity and age, facilitate connections and event
                  participation, ensure safety and enforce our guidelines, and
                  communicate important updates. We never sell your personal data
                  to third parties.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold text-foreground">
                  3. Data Security
                </h3>
                <p>
                  We employ industry-standard encryption, secure server
                  infrastructure, and regular security audits to protect your
                  data. All communications are encrypted in transit and at rest.
                  However, no system is completely secure, and we cannot
                  guarantee absolute security.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold text-foreground">
                  4. Anonymity & Data Sharing
                </h3>
                <p>
                  Your anonymity is paramount. We will never share your identity
                  with other users without your explicit consent. We may share
                  anonymized, aggregated data for analytical purposes. We will
                  comply with valid legal requests for user data as required by
                  law, and will notify affected users when legally permitted to
                  do so.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold text-foreground">
                  5. Data Retention & Deletion
                </h3>
                <p>
                  You may request deletion of your account and associated data
                  at any time. Upon account deletion, your personal data will be
                  permanently removed within 30 days. Some anonymized data may
                  be retained for legal and operational purposes.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold text-foreground">
                  6. Cookies & Tracking
                </h3>
                <p>
                  We use essential cookies for authentication and session
                  management. We do not use third-party tracking cookies or
                  advertising networks. The age verification cookie
                  (&quot;paixao_age_verified&quot;) is stored for 30 days.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold text-foreground">
                  7. Your Rights
                </h3>
                <p>
                  You have the right to access, correct, or delete your personal
                  data; object to or restrict processing of your data; receive a
                  copy of your data in a portable format; and withdraw consent at
                  any time. To exercise these rights, contact us at{" "}
                  <span className="font-medium text-accent">
                    privacy@paixao.club
                  </span>
                  .
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold text-foreground">
                  8. Contact
                </h3>
                <p>
                  For questions about these policies or your data, please
                  contact our privacy team at{" "}
                  <span className="font-medium text-accent">
                    privacy@paixao.club
                  </span>
                  .
                </p>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
