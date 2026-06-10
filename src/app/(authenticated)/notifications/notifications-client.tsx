"use client";

import { NotificationCenter } from "@/components/notifications/notification-center";

export function NotificationsClient() {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
      {/* ── Ambient aura backdrop (Velvet Aura) ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.18] mix-blend-screen"
          style={{ backgroundImage: "url(/generated/bg-bar.webp)" }}
        />
        <div className="aura-field absolute inset-0 animate-aura-drift opacity-60" />
        <div className="absolute left-1/2 top-[-12%] h-[440px] w-[640px] -translate-x-1/2 rounded-full bg-accent/[0.06] blur-[130px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
      </div>

      <div className="relative z-10 px-4 py-6 md:px-6 md:py-8">
        <NotificationCenter />
      </div>

      {/* ── Atmosphere overlays ── */}
      <div className="vignette" aria-hidden />
      <div className="film-grain" aria-hidden />
    </div>
  );
}
