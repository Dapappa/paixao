import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { matchActionSchema } from "@/lib/utils/validators";

/* ─────────────────────────────────────────────
   POST /api/matches/action — like / pass / super_like
   ───────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = matchActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { target_id, action } = parsed.data;

    // Prevent self-action
    if (target_id === user.id) {
      return NextResponse.json(
        { error: "Cannot perform action on yourself" },
        { status: 400 }
      );
    }

    // Check if blocked using the is_blocked() DB function
    const { data: blockCheck } = await supabase.rpc("is_blocked" as never, {
      user_a: user.id,
      user_b: target_id,
    } as never);

    if (blockCheck) {
      return NextResponse.json(
        { error: "This user is not available" },
        { status: 404 }
      );
    }

    // Check target profile exists and is visible
    const { data: targetProfile } = await (supabase.from("profiles") as any)
      .select("id, display_name, avatar_url, profile_visibility")
      .eq("id", target_id)
      .single();

    if (!targetProfile || targetProfile.profile_visibility === "hidden") {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Insert match action (upsert to handle re-swipes)
    const { error: actionError } = await (supabase.from("match_actions") as any)
      .upsert(
        {
          actor_id: user.id,
          target_id,
          action,
          created_at: new Date().toISOString(),
        },
        { onConflict: "actor_id,target_id" }
      );

    if (actionError) {
      console.error("Match action error:", actionError);
      return NextResponse.json(
        { error: "Failed to record action" },
        { status: 500 }
      );
    }

    // Check if a match was created by the DB trigger (check_mutual_match)
    let matched = false;
    let matchId: string | null = null;
    let conversationId: string | null = null;

    if (action === "like" || action === "super_like") {
      // Look for an active match between these two users
      const { data: matchRow } = await (supabase.from("matches") as any)
        .select("id, conversation_id, status")
        .or(
          `and(profile_a.eq.${user.id},profile_b.eq.${target_id}),and(profile_a.eq.${target_id},profile_b.eq.${user.id})`
        )
        .eq("status", "active")
        .single();

      if (matchRow) {
        matched = true;
        matchId = matchRow.id;
        conversationId = matchRow.conversation_id;

        // Insert notifications for both users
        const now = new Date().toISOString();
        await (supabase.from("notifications") as any).insert([
          {
            user_id: user.id,
            type: "new_match",
            title: "New Match!",
            body: `You matched with ${targetProfile.display_name || "someone special"}!`,
            data: { match_id: matchId, profile_id: target_id },
            created_at: now,
          },
          {
            user_id: target_id,
            type: "new_match",
            title: "New Match!",
            body: `You have a new match!`,
            data: { match_id: matchId, profile_id: user.id },
            created_at: now,
          },
        ]);
      }
    }

    return NextResponse.json({
      action,
      matched,
      match_id: matchId,
      conversation_id: conversationId,
    });
  } catch (err) {
    console.error("Match action POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
