import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ConversationClient } from "./conversation-client";

export const metadata = {
  title: "Conversation | Paixão",
  description: "A private thread, just between the two of you.",
};

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const { conversationId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && process.env.PREVIEW_AUTH !== "1") {
    redirect("/auth/login");
  }

  // Validate the conversation exists and user is a participant
  const { data: conv, error } = await (supabase.from("conversations") as any)
    .select("id, participant_a, participant_b")
    .eq("id", conversationId)
    .single();

  if (error || !conv) {
    notFound();
  }

  if (user && conv.participant_a !== user.id && conv.participant_b !== user.id) {
    notFound();
  }

  return <ConversationClient conversationId={conversationId} />;
}
