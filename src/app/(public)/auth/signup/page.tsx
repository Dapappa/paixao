import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";
import { SignupShell } from "./signup-shell";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Paixão account. Anonymous, safe, consent-first.",
};

export default function SignupPage() {
  return (
    <SignupShell>
      <SignupForm />
    </SignupShell>
  );
}
