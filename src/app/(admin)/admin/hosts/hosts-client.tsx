"use client";

import { HostApplications } from "@/components/admin/host-applications";

export function HostsPageClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Host Applications</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Review and process host applications. Approved users get the host role.
        </p>
      </div>
      <HostApplications />
    </div>
  );
}
