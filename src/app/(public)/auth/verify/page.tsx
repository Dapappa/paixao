"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  async function handleResend() {
    setIsResending(true);
    setResendMessage(null);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.email) {
        const { error } = await supabase.auth.resend({
          type: "signup",
          email: session.user.email,
        });

        if (error) {
          setResendMessage("Failed to resend. Please try again later.");
        } else {
          setResendMessage("Verification email resent successfully!");
        }
      } else {
        setResendMessage(
          "Unable to determine your email. Please sign up again."
        );
      }
    } catch {
      setResendMessage("An error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-12">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.04] blur-[100px]" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-xl border border-border/50 bg-surface/60 p-8 backdrop-blur-sm sm:p-10">
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <motion.div variants={fadeUp} custom={0}>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface">
                <Mail className="h-8 w-8 text-gold" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-serif text-2xl font-bold text-foreground"
            >
              Check Your Email
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-3 text-sm leading-relaxed text-text-secondary"
            >
              We&apos;ve sent a verification link to your email address. Click
              the link to verify your account and get started.
            </motion.p>

            {/* Instructions */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-6 w-full rounded-lg border border-border/50 bg-background/50 p-4"
            >
              <p className="text-xs leading-relaxed text-text-secondary">
                <span className="font-medium text-foreground">
                  Didn&apos;t receive the email?
                </span>{" "}
                Check your spam folder, or click below to resend.
              </p>
            </motion.div>

            {/* Resend button */}
            <motion.div variants={fadeUp} custom={4} className="mt-6 w-full">
              <Button
                variant="outline"
                size="lg"
                onClick={handleResend}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Resend Verification Email"
                )}
              </Button>

              {resendMessage && (
                <p className="mt-3 text-xs text-text-secondary">
                  {resendMessage}
                </p>
              )}
            </motion.div>

            {/* Back to login */}
            <motion.div variants={fadeUp} custom={5} className="mt-6">
              <Link
                href="/auth/login"
                className="flex items-center gap-1 text-sm text-text-secondary hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to login
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
