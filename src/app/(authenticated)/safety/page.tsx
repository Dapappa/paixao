import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SafetyHubClient } from "./safety-hub-client";

export const metadata = {
  title: "Safety Center | Paixão",
  description: "Your safety tools, resources, and reporting center",
};

export default async function SafetyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && process.env.PREVIEW_AUTH !== "1") {
    redirect("/auth/login");
  }

  return <SafetyHubClient />;
}
