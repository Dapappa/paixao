"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeSlash, CircleNotch } from "@phosphor-icons/react/ssr";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const riseIn = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.09, duration: 0.6, ease: [0.05, 0.7, 0.1, 1] as const },
  }),
};

const inputClass =
  "border-border/70 bg-surface/60 text-foreground transition-colors placeholder:text-text-secondary/60 focus-visible:border-gold/50 focus-visible:ring-gold/30";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Email */}
      <motion.div variants={riseIn} custom={0} className="space-y-2">
        <Label htmlFor="email" className="text-xs font-medium uppercase tracking-[0.2em] text-text-secondary">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className={inputClass}
        />
      </motion.div>

      {/* Password */}
      <motion.div variants={riseIn} custom={1} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-xs font-medium uppercase tracking-[0.2em] text-text-secondary">
            Password
          </Label>
          <Link
            href="/auth/forgot-password"
            className="text-xs text-text-secondary transition-colors hover:text-gold"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={`${inputClass} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeSlash className="h-4 w-4" weight="light" />
            ) : (
              <Eye className="h-4 w-4" weight="light" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-danger/25 bg-danger/10 px-4 py-3 text-sm leading-relaxed text-danger"
        >
          {error}
        </motion.div>
      )}

      {/* Submit */}
      <motion.div variants={riseIn} custom={2} className="pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <CircleNotch className="mr-2 h-4 w-4 animate-spin" weight="bold" />
              Slipping you in...
            </>
          ) : (
            "Step back inside"
          )}
        </Button>
      </motion.div>

      {/* Signup link */}
      <motion.p
        variants={riseIn}
        custom={3}
        className="text-center text-sm text-text-secondary"
      >
        Not a member yet?{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-gold transition-colors hover:text-foreground"
        >
          Request an invite
        </Link>
      </motion.p>
    </motion.form>
  );
}
