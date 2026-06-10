import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MessagesClient } from "./messages-client";

export const metadata = {
  title: "Messages | Paixão",
  description: "Quiet, private conversations — kept between you and the people you've matched with.",
};

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && process.env.PREVIEW_AUTH !== "1") {
    redirect("/auth/login");
  }

  return <MessagesClient />;
}
