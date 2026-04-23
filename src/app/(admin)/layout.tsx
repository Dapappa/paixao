import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "./admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // Verify admin role from profiles table
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("id, display_name, avatar_url, role")
    .eq("id", session.user.id)
    .in("role", ["admin", "moderator"])
    .single();

  if (!profile) {
    redirect("/dashboard");
  }

  return (
    <AdminShell
      user={{
        id: profile.id,
        displayName: profile.display_name || "Admin",
        avatarUrl: profile.avatar_url || null,
        role: profile.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
