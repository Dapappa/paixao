import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────
   GET /api/matches/groups/[groupId]
   ───────────────────────────────────────────── */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: group, error } = await (supabase.from("match_groups") as any)
      .select(`
        id,
        name,
        group_type,
        description,
        is_visible,
        created_by,
        created_at,
        match_group_members(
          profile_id,
          role,
          joined_at,
          profiles!match_group_members_profile_id_fkey(
            id, display_name, avatar_url, tagline
          )
        )
      `)
      .eq("id", groupId)
      .single();

    if (error || !group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    // Check membership
    const members = (group.match_group_members || []) as Array<{
      profile_id: string;
      role: string;
    }>;
    const isMember = members.some((m) => m.profile_id === user.id);

    if (!isMember && !group.is_visible) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    const myRole = members.find((m) => m.profile_id === user.id)?.role || null;

    return NextResponse.json({ group: { ...group, my_role: myRole } });
  } catch (err) {
    console.error("Group GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ─────────────────────────────────────────────
   PUT /api/matches/groups/[groupId] (owner only)
   ───────────────────────────────────────────── */

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const { data: membership } = await (
      supabase.from("match_group_members") as any
    )
      .select("role")
      .eq("group_id", groupId)
      .eq("profile_id", user.id)
      .single();

    if (!membership || membership.role !== "owner") {
      return NextResponse.json(
        { error: "Only the group owner can update this group" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const allowedFields: Record<string, unknown> = {};
    if (typeof body.name === "string") allowedFields.name = body.name;
    if (typeof body.description === "string")
      allowedFields.description = body.description;
    if (typeof body.is_visible === "boolean")
      allowedFields.is_visible = body.is_visible;
    if (typeof body.group_type === "string")
      allowedFields.group_type = body.group_type;

    const { data, error } = await (supabase.from("match_groups") as any)
      .update({ ...allowedFields, updated_at: new Date().toISOString() })
      .eq("id", groupId)
      .select()
      .single();

    if (error) {
      console.error("Group update error:", error);
      return NextResponse.json(
        { error: "Failed to update group" },
        { status: 500 }
      );
    }

    return NextResponse.json({ group: data });
  } catch (err) {
    console.error("Group PUT error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ─────────────────────────────────────────────
   DELETE /api/matches/groups/[groupId] (owner only)
   ───────────────────────────────────────────── */

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const { data: membership } = await (
      supabase.from("match_group_members") as any
    )
      .select("role")
      .eq("group_id", groupId)
      .eq("profile_id", user.id)
      .single();

    if (!membership || membership.role !== "owner") {
      return NextResponse.json(
        { error: "Only the group owner can delete this group" },
        { status: 403 }
      );
    }

    // Delete members first, then group
    await (supabase.from("match_group_members") as any)
      .delete()
      .eq("group_id", groupId);

    const { error } = await (supabase.from("match_groups") as any)
      .delete()
      .eq("id", groupId);

    if (error) {
      console.error("Group delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete group" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Group DELETE error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
