"use client";

import { MessagesClient } from "../messages-client";

interface ConversationClientProps {
  conversationId: string;
}

/**
 * Client wrapper for the [conversationId] route.
 *
 * On desktop this renders the full two-panel layout with the
 * conversation pre-selected. On mobile it renders the message
 * thread full-screen with a back button.
 */
export function ConversationClient({
  conversationId,
}: ConversationClientProps) {
  return <MessagesClient initialConversationId={conversationId} />;
}
