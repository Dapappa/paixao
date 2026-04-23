"use client";

import { NotificationCenter } from "@/components/notifications/notification-center";

export function NotificationsClient() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] px-4 py-6 md:px-6 md:py-8">
      <NotificationCenter />
    </div>
  );
}
