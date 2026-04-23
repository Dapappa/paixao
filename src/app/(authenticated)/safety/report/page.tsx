import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReportPageClient } from "./report-page-client";

export const metadata = {
  title: "Report an Issue | PassionDen",
  description: "Report a safety concern, harassment, or policy violation",
};

export default async function ReportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <ReportPageClient />;
}
