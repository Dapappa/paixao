"use client";

import { UserTable } from "@/components/admin/user-table";

export function UsersPageClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Users</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage user accounts, roles, and permissions
        </p>
      </div>
      <UserTable />
    </div>
  );
}
