import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MyEventsClient } from "./my-events-client";

export const metadata = {
  title: "My Events | Paixão",
  description: "Manage your events and registrations",
};

export default async function MyEventsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch events user is attending
  const { data: registrations } = await (
    supabase.from("event_registrations") as any
  )
    .select(
      "id, status, check_in_code, event:events(id, title, slug, starts_at, ends_at, venue_city, format, event_type, cover_image_url, status, current_attendees, capacity)"
    )
    .eq("profile_id", user.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  // Fetch events user is hosting
  const { data: hostedEvents } = await (supabase.from("events") as any)
    .select("*")
    .eq("host_id", user.id)
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  return (
    <MyEventsClient
      registrations={registrations || []}
      hostedEvents={hostedEvents || []}
    />
  );
}
