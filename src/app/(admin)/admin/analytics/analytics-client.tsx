"use client";

import { AnalyticsCharts } from "@/components/admin/analytics-charts";

export function AnalyticsPageClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Analytics</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Platform performance, user growth, and revenue trends
        </p>
      </div>
      <AnalyticsCharts />
    </div>
  );
}
