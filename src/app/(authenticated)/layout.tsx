import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthenticatedShell } from "./authenticated-shell";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // DEV-ONLY preview: walk the authenticated UI without a Supabase session.
  const previewAuth = process.env.PREVIEW_AUTH === "1";

  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session && !previewAuth) {
    redirect("/auth/login");
  }

  // In preview (no session) treat onboarding as complete so the full app chrome
  // shows instead of bouncing to /onboarding.
  let onboardingCompleted = previewAuth;
  if (session) {
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
  }

  return (
    <AuthenticatedShell onboardingCompleted={onboardingCompleted}>
      {children}
    </AuthenticatedShell>
  );
}
