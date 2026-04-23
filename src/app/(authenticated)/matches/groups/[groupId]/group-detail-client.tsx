"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Crown,
  Users,
  Pencil,
  Trash2,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */

interface GroupMember {
  profile_id: string;
  role: string;
  joined_at: string;
  profiles: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    tagline: string | null;
  } | null;
}

interface GroupDetail {
  id: string;
  name: string;
  group_type: string;
  description: string | null;
  is_visible: boolean;
  created_by: string;
  created_at: string;
  match_group_members: GroupMember[];
  my_role: string | null;
}

const typeLabels: Record<string, string> = {
  couple: "Couple",
  triad: "Triad",
  quad: "Quad",
  polycule: "Polycule",
  other: "Group",
};

const typeColors: Record<string, string> = {
  couple: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  triad: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  quad: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  polycule: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  other: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

/* ─────────────────────────────────────────────
   GroupDetailClient
   ───────────────────────────────────────────── */

interface GroupDetailClientProps {
  groupId: string;
}

export function GroupDetailClient({ groupId }: GroupDetailClientProps) {
  const router = useRouter();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchGroup = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/matches/groups/${groupId}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Group not found");
      }
      const data = await res.json();
      setGroup(data.group);
      setEditName(data.group.name);
      setEditDesc(data.group.description || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const handleSave = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/matches/groups/${groupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDesc.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to update group");
      }
      const data = await res.json();
      setGroup((prev) => (prev ? { ...prev, ...data.group } : prev));
      setEditing(false);
      toast.success("Group updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update group"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this group? This cannot be undone.")) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/matches/groups/${groupId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to delete group");
      }
      toast.success("Group deleted");
      router.push("/matches/groups");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete group"
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="space-y-6">
        <Link
          href="/matches/groups"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Groups
        </Link>
        <div className="rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-6 text-center">
          <p className="text-sm text-[var(--color-danger)]">
            {error || "Group not found"}
          </p>
        </div>
      </div>
    );
  }

  const isOwner = group.my_role === "owner";
  const members = group.match_group_members || [];
  const typeLabel = typeLabels[group.group_type] || "Group";
  const typeColor = typeColors[group.group_type] || typeColors.other;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/matches/groups"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:border-foreground/30 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          {editing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="font-serif text-2xl font-bold bg-surface-elevated border-border"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-3xl font-bold text-foreground truncate">
                {group.name}
              </h1>
              <Badge
                variant="outline"
                className={cn("text-[10px] border shrink-0", typeColor)}
              >
                {typeLabel}
              </Badge>
            </div>
          )}
        </div>

        {isOwner && !editing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setEditing(true)}
              className="h-9 w-9 border-border"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              disabled={deleting}
              className="h-9 w-9 border-[var(--color-danger)]/30 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
            >
              {deleting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {editing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setEditing(false);
                setEditName(group.name);
                setEditDesc(group.description || "");
              }}
              className="h-9 w-9 border-border"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={handleSave}
              disabled={saving}
              className="h-9 w-9 bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
            >
              {saving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-surface p-5"
      >
        {editing ? (
          <Textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Add a group description..."
            rows={3}
            maxLength={500}
            className="bg-surface-elevated border-border resize-none"
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {group.description || "No description set."}
          </p>
        )}
      </motion.div>

      {/* Members */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-surface p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--color-accent)]" />
            Members ({members.length})
          </h2>
        </div>

        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.profile_id}
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-surface-elevated transition-colors"
            >
              <Link href={`/matches/${member.profile_id}`}>
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={member.profiles?.avatar_url || undefined}
                    alt={member.profiles?.display_name || ""}
                  />
                  <AvatarFallback className="bg-[var(--color-accent-muted)] text-[var(--color-accent)] text-sm">
                    {(member.profiles?.display_name || "?")[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/matches/${member.profile_id}`}
                  className="text-sm font-medium text-foreground hover:text-[var(--color-accent)] transition-colors"
                >
                  {member.profiles?.display_name || "Anonymous"}
                </Link>
                {member.profiles?.tagline && (
                  <p className="text-xs text-muted-foreground truncate">
                    {member.profiles.tagline}
                  </p>
                )}
              </div>

              {member.role === "owner" && (
                <Badge
                  variant="outline"
                  className="border-[var(--color-gold)]/30 text-[var(--color-gold)] text-[10px]"
                >
                  <Crown className="mr-0.5 h-3 w-3" />
                  Owner
                </Badge>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
