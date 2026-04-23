import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { blockSchema } from "@/lib/utils/validators";

/* ─────────────────────────────────────────────
   POST /api/safety/block — block a user
   ───────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = blockSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { blocked_id, reason } = parsed.data;

    if (blocked_id === user.id) {
      return NextResponse.json(
        { error: "Cannot block yourself" },
        { status: 400 }
      );
    }

    // Insert block record
    const { error: blockError } = await (supabase.from("blocks") as any)
      .upsert(
        {
          blocker_id: user.id,
          blocked_id,
          reason: reason || null,
        },
        { onConflict: "blocker_id,blocked_id" }
      );

    if (blockError) {
      console.error("Block insert error:", blockError);
      return NextResponse.json(
        { error: "Failed to block user" },
        { status: 500 }
      );
    }

    // Update any existing match to 'blocked'
    await (supabase.from("matches") as any)
      .update({ status: "blocked" })
      .or(
        `and(profile_a.eq.${user.id},profile_b.eq.${blocked_id}),and(profile_a.eq.${blocked_id},profile_b.eq.${user.id})`
      );

    // Update any existing conversation to 'blocked'
    await (supabase.from("conversations") as any)
      .update({ status: "blocked" })
      .or(
        `and(participant_a.eq.${user.id},participant_b.eq.${blocked_id}),and(participant_a.eq.${blocked_id},participant_b.eq.${user.id})`
      );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Block POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
