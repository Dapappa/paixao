import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EventDetailClient } from "./event-detail-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data } = await (supabase.from("events") as any)
    .select("title, short_description")
    .eq("id", eventId)
    .single();

  return {
    title: data?.title
      ? `${data.title} | PassionDen`
      : "Event | PassionDen",
    description: data?.short_description || "View event details",
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = await createClient();

  // Fetch event with host info
  const { data: event, error } = await (supabase.from("events") as any)
    .select(
      "*, host:profiles!events_host_id_fkey(id, display_name, avatar_url)"
    )
    .eq("id", eventId)
    .single();

  if (error || !event) {
    notFound();
  }

  // Check if current user is registered
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let registration = null;
  if (user) {
    const { data: reg } = await (supabase.from("event_registrations") as any)
      .select("*")
      .eq("event_id", eventId)
      .eq("profile_id", user.id)
      .in("status", ["pending", "confirmed", "waitlisted", "checked_in"])
      .single();

    registration = reg;
  }

  return (
    <EventDetailClient
      event={event}
      registration={registration}
      userId={user?.id || null}
    />
  );
}
