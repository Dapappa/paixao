"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

export default function AgeGatePage() {
  const router = useRouter();

  function handleEnter() {
    // Set cookie with 30-day expiry
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    document.cookie = `paixao_age_verified=true; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    router.push("/");
  }

  function handleExit() {
    window.location.href = "https://www.google.com";
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.04] blur-[120px]" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        className="relative z-10 flex w-full max-w-md flex-col items-center text-center"
      >
        {/* Logo */}
        <motion.div variants={fadeUp} custom={0}>
          <span className="font-serif text-3xl font-bold tracking-wider text-foreground">
            PAIX<span className="text-accent">A</span>O
          </span>
        </motion.div>

        {/* Icon */}
        <motion.div variants={fadeUp} custom={1} className="mt-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface">
            <ShieldAlert className="h-8 w-8 text-accent" />
          </div>
        </motion.div>

        {/* Warning */}
        <motion.div variants={fadeUp} custom={2} className="mt-6">
          <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
            Age Verification Required
          </h1>
        </motion.div>

        <motion.p
          variants={fadeUp}
          custom={3}
          className="mt-4 text-sm leading-relaxed text-text-secondary"
        >
          This platform contains adult content intended for individuals{" "}
          <span className="font-medium text-foreground">
            18 years of age or older
          </span>
          .
        </motion.p>

        <motion.p
          variants={fadeUp}
          custom={4}
          className="mt-3 text-sm leading-relaxed text-text-secondary"
        >
          By entering, you confirm that you are at least 18 years old and
          consent to viewing adult content.
        </motion.p>

        {/* Divider */}
        <motion.div
          variants={fadeUp}
          custom={5}
          className="my-8 h-px w-full bg-border"
        />

        {/* Buttons */}
        <motion.div
          variants={fadeUp}
          custom={6}
          className="flex w-full flex-col gap-3"
        >
          <Button
            size="lg"
            onClick={handleEnter}
            className="w-full text-sm font-semibold"
          >
            I am 18 or older — Enter
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleExit}
            className="w-full text-sm"
          >
            I am under 18 — Exit
          </Button>
        </motion.div>

        {/* Legal disclaimer */}
        <motion.p
          variants={fadeUp}
          custom={7}
          className="mt-8 text-[11px] leading-relaxed text-text-secondary/60"
        >
          By proceeding, you agree to our Terms of Service and confirm compliance
          with all applicable laws in your jurisdiction regarding adult content.
        </motion.p>
      </motion.div>
    </div>
  );
}
