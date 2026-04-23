import { createClient } from "@/lib/supabase/server";
import { MatchesDiscoveryClient } from "./matches-discovery-client";

export const metadata = {
  title: "Discover | PassionDen",
  description: "Find your next connection in the PassionDen community",
};

export default async function MatchesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let subscriptionTier = "curious";
  if (user) {
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    subscriptionTier = profile?.subscription_tier || "curious";
  }

  return <MatchesDiscoveryClient subscriptionTier={subscriptionTier} />;
}
