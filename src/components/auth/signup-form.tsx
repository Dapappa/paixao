"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    if (!ageConfirmed) {
      setError("You must confirm that you are at least 18 years old.");
      return;
    }
    if (!termsAccepted) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      router.push("/auth/verify");
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

      {/* Password */}
      <motion.div variants={fadeUp} custom={1} className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="bg-surface border-border pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Confirm Password */}
      <motion.div variants={fadeUp} custom={2} className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type={showPassword ? "text" : "password"}
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="bg-surface border-border"
        />
      </motion.div>

      {/* Checkboxes */}
      <motion.div variants={fadeUp} custom={3} className="space-y-3 pt-1">
        <div className="flex items-start gap-3">
          <Checkbox
            id="age-confirm"
            checked={ageConfirmed}
            onCheckedChange={(checked) => setAgeConfirmed(checked === true)}
          />
          <Label
            htmlFor="age-confirm"
            className="text-sm leading-relaxed text-text-secondary cursor-pointer"
          >
            I confirm I am at least{" "}
            <span className="font-medium text-foreground">18 years of age</span>
          </Label>
        </div>
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms-accept"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          />
          <Label
            htmlFor="terms-accept"
            className="text-sm leading-relaxed text-text-secondary cursor-pointer"
          >
            I agree to the{" "}
            <Link
              href="/terms"
              className="font-medium text-accent hover:text-accent-hover underline underline-offset-2"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/terms"
              className="font-medium text-accent hover:text-accent-hover underline underline-offset-2"
            >
              Privacy Policy
            </Link>
          </Label>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
        </motion.div>
      )}

      {/* Submit */}
      <motion.div variants={fadeUp} custom={4} className="pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="w-full font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </motion.div>

      {/* Login link */}
      <motion.p
        variants={fadeUp}
        custom={5}
        className="text-center text-sm text-text-secondary"
      >
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-accent hover:text-accent-hover transition-colors"
        >
          Log in
        </Link>
      </motion.p>
    </motion.form>
  );
}
