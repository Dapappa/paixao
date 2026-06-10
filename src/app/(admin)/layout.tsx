import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "./admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // DEV-ONLY preview: walk the admin UI without a Supabase session.
  const previewAuth = process.env.PREVIEW_AUTH === "1";

  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session && !previewAuth) {
    redirect("/auth/login");
  }

  // Verify admin role from profiles table
  let profile: { id: string; display_name: string | null; avatar_url: string | null; role: string } | null = null;
  if (session) {
    const { data } = await (supabase.from("profiles") as any)
      .select("id, display_name, avatar_url, role")
      .eq("id", session.user.id)
      .in("role", ["admin", "moderator"])
      .single();
    profile = data;
    if (!profile) {
      redirect("/dashboard");
    }
  }

  if (!profile && previewAuth) {
    profile = { id: "preview", display_name: "Preview Admin", avatar_url: null, role: "admin" };
  }

  if (!profile) {
    redirect("/auth/login");
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
