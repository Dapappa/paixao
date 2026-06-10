"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CircleNotch, Envelope, CheckCircle } from "@phosphor-icons/react/ssr";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setIsSubmitted(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-12">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.04] blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border/50 bg-surface/60 p-6 backdrop-blur-sm sm:p-8">
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-4 text-center"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-7 w-7 text-success" weight="fill" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Check your email
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Click the link in the email to reset your password.
              </p>
              <p className="mt-4 text-xs text-text-secondary/60">
                Didn&apos;t receive it? Check your spam folder or try again.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => setIsSubmitted(false)}
              >
                Try again
              </Button>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              initial="hidden"
              animate="visible"
              className="space-y-5"
            >
              <motion.div variants={fadeUp} custom={0} className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-surface border-border"
                />
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger"
                >
                  {error}
                </motion.div>
              )}

              <motion.div variants={fadeUp} custom={1} className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="w-full font-semibold"
                >
                  {isLoading ? (
                    <>
                      <CircleNotch className="mr-2 h-4 w-4 animate-spin" weight="bold" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Envelope className="mr-2 h-4 w-4" weight="light" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </motion.div>

              <motion.div variants={fadeUp} custom={2}>
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-1 text-sm text-text-secondary hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" weight="bold" />
                  Back to login
                </Link>
              </motion.div>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
}
