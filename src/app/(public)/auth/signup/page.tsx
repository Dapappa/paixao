import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Paixao account. Anonymous, safe, consent-first.",
};

export default function SignupPage() {
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
            Create Your Account
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Join an exclusive community built on trust and discretion.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border/50 bg-surface/60 p-6 backdrop-blur-sm sm:p-8">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
