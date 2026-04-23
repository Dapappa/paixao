import { createClient } from "@/lib/supabase/server";

/**
 * Verify the current user is an admin or moderator.
 * Returns { user, profile } on success, or { error, status } on failure.
 */
export async function verifyAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 } as const;
  }

  const { data: profile } = await (supabase.from("profiles") as any)
    .select("id, display_name, avatar_url, role")
    .eq("id", user.id)
    .in("role", ["admin", "moderator"])
    .single();

  if (!profile) {
    return { error: "Forbidden: admin access required", status: 403 } as const;
  }

  return {
    user,
    profile: profile as {
      id: string;
      display_name: string;
      avatar_url: string | null;
      role: string;
    },
  };
}
