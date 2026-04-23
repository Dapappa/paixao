import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreateEventClient } from "./create-event-client";

export const metadata = {
  title: "Create Event | PassionDen",
  description: "Host an exclusive event on PassionDen",
};

export default async function CreateEventPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check profile / host eligibility
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("id, subscription_tier, onboarding_completed")
    .eq("id", user.id)
    .single();

  // For now, allow all authenticated users with completed onboarding
  // In production, restrict to host/admin roles
  const isEligible = profile?.onboarding_completed !== false;

  return <CreateEventClient isEligible={isEligible} />;
}
