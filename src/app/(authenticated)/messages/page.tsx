import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MessagesClient } from "./messages-client";

export const metadata = {
  title: "Messages | PassionDen",
  description: "Your private conversations",
};

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <MessagesClient />;
}
