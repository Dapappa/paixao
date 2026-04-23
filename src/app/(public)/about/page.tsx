"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Heart, Eye, Users } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
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

const values = [
  {
    icon: Shield,
    title: "Safety First",
    description:
      "Every feature is designed with your safety in mind. From verified accounts to robust reporting systems, we maintain an environment where everyone can feel secure.",
  },
  {
    icon: Heart,
    title: "Consent Always",
    description:
      "Consent isn't just a checkbox — it's woven into the fabric of every interaction. Clear communication of boundaries is celebrated and enforced.",
  },
  {
    icon: Eye,
    title: "True Anonymity",
    description:
      "Your real identity is yours to keep. Our platform is built so you control exactly what you share, with whom, and when.",
  },
  {
    icon: Users,
    title: "Inclusive Community",
    description:
      "We welcome all consenting adults regardless of orientation, identity, or relationship style. Respect and acceptance are non-negotiable.",
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-dvh">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-accent/[0.04] blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-gold/[0.03] blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Hero */}
        <AnimatedSection className="text-center">
          <motion.span
            variants={fadeUp}
            custom={0}
            className="inline-block text-xs font-medium uppercase tracking-widest text-gold"
          >
            About Us
          </motion.span>
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mt-4 font-serif text-4xl font-bold tracking-tight sm:text-5xl"
          >
            What is <span className="text-gradient-brand">PassionDen</span>?
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary"
          >
            PassionDen is an exclusive platform designed for consenting adults who
            seek meaningful connections, curated experiences, and a community
            that respects their privacy and boundaries above all else.
          </motion.p>
        </AnimatedSection>

        {/* Mission */}
        <AnimatedSection className="mt-20">
          <motion.div
            variants={fadeUp}
            custom={0}
            className="rounded-xl border border-border/50 bg-surface/40 p-8 backdrop-blur-sm sm:p-12"
          >
            <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
              Our Mission
            </h2>
            <div className="mt-6 space-y-4 text-text-secondary leading-relaxed">
              <p>
                We believe that adult connection should be safe, respectful, and
                empowering. Too many platforms treat privacy as an afterthought
                and consent as a formality. We built PassionDen to be different.
              </p>
              <p>
                Our mission is to create a space where adults can explore their
                desires, forge genuine connections, and attend exclusive events —
                all while maintaining complete control over their identity and
                boundaries.
              </p>
              <p>
                Every feature, every design decision, every policy is guided by
                three principles:{" "}
                <span className="font-medium text-foreground">anonymity</span>,{" "}
                <span className="font-medium text-foreground">consent</span>,
                and{" "}
                <span className="font-medium text-foreground">safety</span>.
              </p>
            </div>
          </motion.div>
        </AnimatedSection>

        {/* Values */}
        <AnimatedSection className="mt-20">
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-center font-serif text-2xl font-bold text-foreground sm:text-3xl"
          >
            Our <span className="text-gradient-gold">Values</span>
          </motion.h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                variants={fadeUp}
                custom={i + 1}
                className="rounded-xl border border-border/50 bg-surface/40 p-6 backdrop-blur-sm transition-colors hover:border-accent/20"
              >
                <div className="mb-4 inline-flex rounded-lg bg-accent-muted p-3">
                  <value.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* Vision */}
        <AnimatedSection className="mt-20">
          <motion.div
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
              The Vision
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-text-secondary leading-relaxed">
              We envision a world where adult platforms are held to the highest
              standards of ethics, safety, and design. PassionDen is not just a
              platform — it&apos;s a movement toward a better, more respectful
              way for adults to connect and experience intimacy on their own
              terms.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-text-secondary leading-relaxed">
              Built by a team that believes technology should empower, not
              exploit. We are committed to transparency, continuous improvement,
              and listening to our community.
            </p>
          </motion.div>
        </AnimatedSection>
      </div>
    </div>
  );
}
