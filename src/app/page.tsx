"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Shield,
  CalendarDays,
  Heart,
  HandHeart,
  UserPlus,
  Search,
  MessageCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Animation helpers                                                   */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function AnimatedSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* Feature cards data                                                  */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: Shield,
    title: "Anonymous & Safe",
    description:
      "Your identity stays yours. Advanced privacy controls ensure you reveal only what you choose, when you choose.",
  },
  {
    icon: CalendarDays,
    title: "Exclusive Events",
    description:
      "Curated, invitation-only gatherings for verified members. From intimate soirees to grand celebrations.",
  },
  {
    icon: Heart,
    title: "Meaningful Connections",
    description:
      "Go beyond the superficial. Our matching system prioritizes genuine compatibility and shared desires.",
  },
  {
    icon: HandHeart,
    title: "Consent-First",
    description:
      "Every interaction is built on mutual agreement. Clear boundaries, respected always. No exceptions.",
  },
];

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Profile",
    description:
      "Sign up anonymously and craft your persona. Share what you want, keep what you don't.",
  },
  {
    icon: Search,
    step: "02",
    title: "Explore & Discover",
    description:
      "Browse curated events, discover compatible members, and find spaces that resonate with your desires.",
  },
  {
    icon: MessageCircle,
    step: "03",
    title: "Connect & Experience",
    description:
      "Engage with consent at every step. From private messages to exclusive events, every moment is intentional.",
  },
];

/* ------------------------------------------------------------------ */
/* Page Component                                                      */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full bg-gold/[0.04] blur-[100px]" />
      </div>

      {/* ── Navigation ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold tracking-wider text-foreground">
              PASSION<span className="text-accent">D</span>EN
            </span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            <Link
              href="/about"
              className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/guidelines"
              className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-foreground"
            >
              Guidelines
            </Link>
            <div className="ml-4 h-5 w-px bg-border" />
            <div className="ml-3 flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
          {/* Mobile: just show auth buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Log In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 pt-16 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mx-auto max-w-4xl"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} custom={0} className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-1.5 text-xs font-medium text-text-secondary backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Exclusive. Anonymous. Consent-first.
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="font-serif text-6xl font-bold tracking-tight sm:text-7xl md:text-8xl lg:text-9xl"
          >
            <span className="text-foreground">PASSION</span>
            <span className="text-gradient-brand">D</span>
            <span className="text-foreground">EN</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-4 font-serif text-xl italic text-gold sm:text-2xl"
          >
            Step inside.
          </motion.p>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            custom={3}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg"
          >
            Where desire meets discretion. An exclusive platform for
            consenting adults to explore connections, attend curated events,
            and discover meaningful relationships — all on their own terms.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            custom={4}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button size="lg" asChild className="group min-w-[180px]">
              <Link href="/auth/signup">
                Join Now
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="min-w-[180px]">
              <a href="#features">Learn More</a>
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-text-secondary"
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <div className="h-8 w-px bg-gradient-to-b from-text-secondary to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features Section ── */}
      <AnimatedSection
        className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
      >
        <div id="features" className="scroll-mt-24">
          <motion.div variants={fadeUp} custom={0} className="text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Why <span className="text-gradient-brand">PassionDen</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
              Built from the ground up with safety, privacy, and pleasure in mind.
              Every feature exists to protect and empower you.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={i + 1}
                className="group relative rounded-xl border border-border/50 bg-surface/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:bg-surface/80 hover:shadow-glow-accent"
              >
                <div className="mb-4 inline-flex rounded-lg bg-accent-muted p-3">
                  <feature.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── How It Works Section ── */}
      <AnimatedSection className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <motion.div variants={fadeUp} custom={0} className="text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            How It <span className="text-gradient-gold">Works</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
            Getting started is simple. Three steps to a world of possibilities.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              variants={fadeUp}
              custom={i + 1}
              className="relative text-center"
            >
              {/* Connecting line (hidden on mobile) */}
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-12 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-border to-transparent md:block" />
              )}
              <div className="relative mx-auto mb-6 inline-flex">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-border/50 bg-surface/80 backdrop-blur-sm">
                  <step.icon className="h-8 w-8 text-gold" />
                </div>
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  {step.step}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-text-secondary">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ── CTA Section ── */}
      <AnimatedSection className="relative z-10 px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            variants={fadeUp}
            custom={0}
            className="relative overflow-hidden rounded-2xl border border-border/50 bg-surface/60 p-12 backdrop-blur-sm sm:p-16"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.08] via-transparent to-gold/[0.05]" />
            <div className="relative">
              <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to explore?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-text-secondary">
                Join an exclusive community that values your privacy, respects
                your boundaries, and celebrates your desires.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" asChild className="group min-w-[200px]">
                  <Link href="/auth/signup">
                    Create Your Account
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
              <p className="mt-6 text-xs text-text-secondary">
                Free to join. 18+ only. Your identity remains anonymous.
              </p>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
            {/* Logo */}
            <div>
              <span className="font-serif text-lg font-bold tracking-wider text-foreground">
                PASSION<span className="text-accent">D</span>EN
              </span>
              <p className="mt-1 text-xs text-text-secondary">
                Step inside. Where desire meets discretion.
              </p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-text-secondary">
              <Link
                href="/about"
                className="transition-colors hover:text-foreground"
              >
                About
              </Link>
              <Link
                href="/guidelines"
                className="transition-colors hover:text-foreground"
              >
                Guidelines
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-foreground"
              >
                Terms
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t border-border/30 pt-6 text-center text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} PassionDen. All rights reserved.
            This platform is intended for adults 18 years of age and older.
          </div>
        </div>
      </footer>
    </div>
  );
}
