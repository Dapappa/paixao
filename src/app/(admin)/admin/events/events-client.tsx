"use client";

import { EventManager } from "@/components/admin/event-manager";

export function EventsPageClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Events</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Moderate events, approve drafts, and manage featured listings
        </p>
      </div>
      <EventManager />
    </div>
  );
}
