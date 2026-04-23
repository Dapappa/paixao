import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────
   GET /api/messages — list user's conversations
   ───────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const perPage = Math.min(
      50,
      Math.max(1, Number(url.searchParams.get("per_page")) || 20),
    );
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // Fetch conversations where user is either participant
    const { data: conversations, error: convError } = await (
      supabase.from("conversations") as any
    )
      .select(
        `
        id,
        participant_a,
        participant_b,
        last_message_at,
        last_message_preview,
        is_archived_a,
        is_archived_b,
        is_muted_a,
        is_muted_b,
        created_at,
        updated_at,
        profile_a:profiles!conversations_participant_a_fkey(id, display_name, avatar_url, public_key),
        profile_b:profiles!conversations_participant_b_fkey(id, display_name, avatar_url, public_key)
      `,
        { count: "exact" },
      )
      .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .range(from, to);

    if (convError) {
      console.error("Conversations fetch error:", convError);
      return NextResponse.json(
        { error: "Failed to fetch conversations" },
        { status: 500 },
      );
    }

    if (!conversations || conversations.length === 0) {
      return NextResponse.json({
        conversations: [],
        page,
        perPage,
      });
    }

    // Get unread counts for each conversation
    const conversationIds = conversations.map((c: any) => c.id);
    const { data: unreadRows } = await (supabase.rpc as any)(
      "get_unread_counts",
      { p_user_id: user.id, p_conversation_ids: conversationIds },
    ).catch(() => ({ data: null }));

    // Build unread count map (fallback: query per conversation)
    let unreadMap: Record<string, number> = {};

    if (unreadRows) {
      for (const row of unreadRows) {
        unreadMap[row.conversation_id] = row.unread_count;
      }
    } else {
      // Fallback: individual queries
      for (const conv of conversations) {
        const { count } = await (supabase.from("messages") as any)
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", user.id)
          .is("read_at", null)
          .eq("is_deleted", false);
        unreadMap[conv.id] = count ?? 0;
      }
    }

    // Shape response — include the OTHER participant's info
    const shaped = conversations.map((conv: any) => {
      const isA = conv.participant_a === user.id;
      const otherProfile = isA ? conv.profile_b : conv.profile_a;
      const isArchived = isA ? conv.is_archived_a : conv.is_archived_b;
      const isMuted = isA ? conv.is_muted_a : conv.is_muted_b;

      return {
        id: conv.id,
        other_user: {
          id: otherProfile?.id ?? null,
          display_name: otherProfile?.display_name ?? "Unknown",
          avatar_url: otherProfile?.avatar_url ?? null,
          public_key: otherProfile?.public_key ?? null,
        },
        last_message_at: conv.last_message_at,
        last_message_preview: conv.last_message_preview,
        unread_count: unreadMap[conv.id] ?? 0,
        is_archived: isArchived,
        is_muted: isMuted,
        created_at: conv.created_at,
      };
    });

    return NextResponse.json({
      conversations: shaped,
      page,
      perPage,
    });
  } catch (err) {
    console.error("Messages GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
