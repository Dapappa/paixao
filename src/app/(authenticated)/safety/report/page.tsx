import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReportPageClient } from "./report-page-client";

export const metadata = {
  title: "Report an Issue | Paixão",
  description: "Report a safety concern, harassment, or policy violation",
};

export default async function ReportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && process.env.PREVIEW_AUTH !== "1") {
    redirect("/auth/login");
  }

  return <ReportPageClient />;
}
