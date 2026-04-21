import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthenticatedShell } from "./authenticated-shell";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // Try to fetch profile to check onboarding status
  let onboardingCompleted = false;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", session.user.id)
      .single();

    onboardingCompleted =
      (profile as { onboarding_completed?: boolean } | null)
        ?.onboarding_completed ?? false;
  } catch {
    // Profile might not exist yet, that's OK
  }

  return (
    <AuthenticatedShell onboardingCompleted={onboardingCompleted}>
      {children}
    </AuthenticatedShell>
  );
}
