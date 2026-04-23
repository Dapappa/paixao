import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendMessageSchema } from "@/lib/utils/validators";
import { encodeForStorage } from "@/lib/utils/encryption";

/* ─────────────────────────────────────────────
   Helper: verify user is a participant
   ───────────────────────────────────────────── */

async function verifyParticipant(supabase: any, conversationId: string, userId: string) {
  const { data: conv, error } = await (supabase.from("conversations") as any)
    .select("id, participant_a, participant_b")
    .eq("id", conversationId)
    .single();

  if (error || !conv) return null;
  if (conv.participant_a !== userId && conv.participant_b !== userId) return null;

  return conv;
}

/* ─────────────────────────────────────────────
   GET /api/messages/[conversationId] — fetch messages
   ───────────────────────────────────────────── */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const { conversationId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify participant
    const conv = await verifyParticipant(supabase, conversationId, user.id);
    if (!conv) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    const url = new URL(req.url);
    const beforeId = url.searchParams.get("before_id");
    const limit = Math.min(
      50,
      Math.max(1, Number(url.searchParams.get("limit")) || 50),
    );

    // Cursor-based pagination
    let query = (supabase.from("messages") as any)
      .select(
        `
        id,
        conversation_id,
        sender_id,
        content,
        encrypted_content,
        message_type,
        media_url,
        media_type,
        is_read,
        read_at,
        is_edited,
        is_deleted,
        reply_to_id,
        metadata,
        created_at,
        sender:profiles!messages_sender_id_fkey(id, display_name, avatar_url)
      `,
      )
      .eq("conversation_id", conversationId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (beforeId) {
      // Get the created_at of the cursor message
      const { data: cursorMsg } = await (supabase.from("messages") as any)
        .select("created_at")
        .eq("id", beforeId)
        .single();

      if (cursorMsg) {
        query = query.lt("created_at", cursorMsg.created_at);
      }
    }

    const { data: messages, error: msgError } = await query;

    if (msgError) {
      console.error("Messages fetch error:", msgError);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 },
      );
    }

    // Determine the other participant for context
    const otherUserId =
      conv.participant_a === user.id ? conv.participant_b : conv.participant_a;

    const { data: otherProfile } = await (supabase.from("profiles") as any)
      .select("id, display_name, avatar_url, public_key")
      .eq("id", otherUserId)
      .single();

    return NextResponse.json({
      messages: messages ?? [],
      hasMore: (messages?.length ?? 0) === limit,
      other_user: otherProfile ?? null,
      conversation: {
        id: conv.id,
        participant_a: conv.participant_a,
        participant_b: conv.participant_b,
      },
    });
  } catch (err) {
    console.error("Messages [id] GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/* ─────────────────────────────────────────────
   POST /api/messages/[conversationId] — send message
   ───────────────────────────────────────────── */

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const { conversationId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify participant
    const conv = await verifyParticipant(supabase, conversationId, user.id);
    if (!conv) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Check if blocked
    const otherUserId =
      conv.participant_a === user.id ? conv.participant_b : conv.participant_a;

    const { data: blockCheck } = await (supabase.rpc as any)("is_blocked", {
      user_a: user.id,
      user_b: otherUserId,
    }).catch(() => ({ data: false }));

    if (blockCheck === true) {
      return NextResponse.json(
        { error: "Cannot send message — user is blocked" },
        { status: 403 },
      );
    }

    // Validate body
    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid message", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { content, message_type } = parsed.data;

    // Phase 1: base64-encode plaintext as encrypted_content, static nonce
    const { encrypted, nonce } = encodeForStorage(content);

    // Insert message
    const { data: newMessage, error: insertError } = await (
      supabase.from("messages") as any
    )
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        encrypted_content: encrypted,
        message_type,
        metadata: { nonce },
      })
      .select(
        `
        id,
        conversation_id,
        sender_id,
        content,
        encrypted_content,
        message_type,
        media_url,
        media_type,
        is_read,
        read_at,
        is_edited,
        is_deleted,
        reply_to_id,
        metadata,
        created_at,
        sender:profiles!messages_sender_id_fkey(id, display_name, avatar_url)
      `,
      )
      .single();

    if (insertError) {
      console.error("Message insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 },
      );
    }

    // Update conversation's last_message_at and last_message_preview
    const preview =
      content.length > 100 ? content.slice(0, 100) + "..." : content;

    await (supabase.from("conversations") as any)
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: preview,
      })
      .eq("id", conversationId);

    // Insert notification for recipient
    await (supabase.from("notifications") as any)
      .insert({
        profile_id: otherUserId,
        type: "message",
        title: "New message",
        body: preview,
        data: {
          conversation_id: conversationId,
          message_id: newMessage.id,
          sender_id: user.id,
        },
        action_url: `/messages/${conversationId}`,
      })
      .catch(() => {
        // Non-critical — don't fail the message send
      });

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (err) {
    console.error("Messages [id] POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
