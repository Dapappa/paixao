import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BlockedUsersClient } from "./blocked-users-client";

export const metadata = {
  title: "Blocked Users | Paixão",
  description: "Manage your blocked users list",
};

export default async function BlockedUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && process.env.PREVIEW_AUTH !== "1") {
    redirect("/auth/login");
  }

  return <BlockedUsersClient />;
}
