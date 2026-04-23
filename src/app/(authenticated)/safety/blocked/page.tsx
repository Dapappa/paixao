import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BlockedUsersClient } from "./blocked-users-client";

export const metadata = {
  title: "Blocked Users | PassionDen",
  description: "Manage your blocked users list",
};

export default async function BlockedUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <BlockedUsersClient />;
}
