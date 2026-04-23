"use client";

import { ReportQueue } from "@/components/admin/report-queue";

export function ReportsPageClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Reports</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Review and resolve user reports. Critical reports are shown first.
        </p>
      </div>
      <ReportQueue />
    </div>
  );
}
