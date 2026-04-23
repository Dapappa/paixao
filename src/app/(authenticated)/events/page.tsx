import { createClient } from "@/lib/supabase/server";
import { EventsBrowseClient } from "./events-browse-client";

export const metadata = {
  title: "Events | PassionDen",
  description: "Browse exclusive events in the PassionDen community",
};

export default async function EventsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user can create events (host/admin role)
  let canCreate = false;
  if (user) {
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    // For now, allow passionate and devoted tiers (premium users) to host
    canCreate =
      profile?.subscription_tier === "passionate" ||
      profile?.subscription_tier === "devoted" ||
      profile?.subscription_tier === "admin";
  }

  return <EventsBrowseClient canCreateEvent={canCreate} />;
}
