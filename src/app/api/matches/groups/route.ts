import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createMatchGroupSchema } from "@/lib/utils/validators";

/* ─────────────────────────────────────────────
   GET /api/matches/groups — list user's groups
   ───────────────────────────────────────────── */

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get groups where user is a member
    const { data: memberships, error: memberError } = await (
      supabase.from("match_group_members") as any
    )
      .select("group_id, role, joined_at")
      .eq("profile_id", user.id);

    if (memberError) {
      console.error("Group memberships error:", memberError);
      return NextResponse.json(
        { error: "Failed to fetch groups" },
        { status: 500 }
      );
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ groups: [] });
    }

    const groupIds = memberships.map(
      (m: { group_id: string }) => m.group_id
    );

    // Fetch group details
    const { data: groups, error: groupError } = await (
      supabase.from("match_groups") as any
    )
      .select(`
        id,
        name,
        group_type,
        description,
        is_visible,
        created_at,
        match_group_members(
          profile_id,
          role,
          profiles!match_group_members_profile_id_fkey(id, display_name, avatar_url)
        )
      `)
      .in("id", groupIds)
      .order("created_at", { ascending: false });

    if (groupError) {
      console.error("Groups fetch error:", groupError);
      return NextResponse.json(
        { error: "Failed to fetch groups" },
        { status: 500 }
      );
    }

    // Merge user's role into each group
    const roleMap = new Map(
      memberships.map((m: { group_id: string; role: string }) => [
        m.group_id,
        m.role,
      ])
    );

    const enrichedGroups = (groups || []).map(
      (g: { id: string; [key: string]: unknown }) => ({
        ...g,
        my_role: roleMap.get(g.id) || "member",
      })
    );

    return NextResponse.json({ groups: enrichedGroups });
  } catch (err) {
    console.error("Groups GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ─────────────────────────────────────────────
   POST /api/matches/groups — create group
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
    const parsed = createMatchGroupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Create the group
    const { data: group, error: groupError } = await (
      supabase.from("match_groups") as any
    )
      .insert({
        name: parsed.data.name,
        group_type: parsed.data.group_type,
        description: parsed.data.description || null,
        is_visible: parsed.data.is_visible,
        created_by: user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (groupError) {
      console.error("Group create error:", groupError);
      return NextResponse.json(
        { error: "Failed to create group" },
        { status: 500 }
      );
    }

    // Add creator as owner member
    const { error: memberError } = await (
      supabase.from("match_group_members") as any
    ).insert({
      group_id: group.id,
      profile_id: user.id,
      role: "owner",
      joined_at: new Date().toISOString(),
    });

    if (memberError) {
      console.error("Group member add error:", memberError);
      // Still return the group even if member creation failed
    }

    return NextResponse.json({ group }, { status: 201 });
  } catch (err) {
    console.error("Groups POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
