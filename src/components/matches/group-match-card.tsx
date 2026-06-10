"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { UsersThree, Crown } from "@phosphor-icons/react/ssr";
import Link from "next/link";

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */

interface GroupMember {
  profile_id: string;
  role: string;
  profiles: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface MatchGroup {
  id: string;
  name: string;
  group_type: string;
  description: string | null;
  is_visible: boolean;
  created_at: string;
  match_group_members: GroupMember[];
  my_role?: string;
}

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

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
   GroupMatchCard
   ───────────────────────────────────────────── */

interface GroupMatchCardProps {
  group: MatchGroup;
  className?: string;
}

export function GroupMatchCard({ group, className }: GroupMatchCardProps) {
  const members = group.match_group_members || [];
  const displayMembers = members.slice(0, 4);
  const extraCount = Math.max(0, members.length - 4);
  const typeLabel = typeLabels[group.group_type] || "Group";
  const typeColor = typeColors[group.group_type] || typeColors.other;

  return (
    <Link href={`/matches/groups/${group.id}`} className="block">
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "group relative overflow-hidden rounded-xl border border-border bg-surface p-5",
          "transition-all duration-300",
          "hover:shadow-[0_0_30px_rgba(194,24,91,0.12)]",
          "hover:border-[var(--color-accent)]/30",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-serif text-lg font-semibold text-foreground truncate group-hover:text-[var(--color-accent)] transition-colors">
                {group.name}
              </h3>
              {group.my_role === "owner" && (
                <Crown weight="fill" className="h-4 w-4 text-[var(--color-gold)] shrink-0" />
              )}
            </div>
            <Badge
              variant="outline"
              className={cn("text-[10px] border", typeColor)}
            >
              {typeLabel}
            </Badge>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated shrink-0">
            <UsersThree weight="light" className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Description */}
        {group.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {group.description}
          </p>
        )}

        {/* Stacked avatars */}
        <div className="flex items-center">
          <div className="flex -space-x-3">
            {displayMembers.map((member, i) => (
              <Avatar
                key={member.profile_id}
                className={cn(
                  "h-9 w-9 ring-2 ring-surface",
                  "transition-transform hover:scale-110 hover:z-10"
                )}
                style={{ zIndex: displayMembers.length - i }}
              >
                <AvatarImage
                  src={member.profiles?.avatar_url || undefined}
                  alt={member.profiles?.display_name || ""}
                />
                <AvatarFallback className="bg-[var(--color-accent-muted)] text-[var(--color-accent)] text-xs font-medium">
                  {(member.profiles?.display_name || "?")[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {extraCount > 0 && (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated ring-2 ring-surface text-xs text-muted-foreground font-medium">
                +{extraCount}
              </div>
            )}
          </div>
          <span className="ml-3 text-xs text-muted-foreground">
            {members.length} {members.length === 1 ? "member" : "members"}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
