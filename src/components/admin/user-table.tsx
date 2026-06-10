"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import {
  Prohibit,
  Check,
  CaretLeft,
  CaretRight,
  Eye,
  DotsThree,
  MagnifyingGlass,
  Shield,
  ShieldSlash,
  X,
} from "@phosphor-icons/react/ssr";
import { formatDistanceToNow } from "date-fns";

interface User {
  id: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
  subscription_tier: string;
  is_banned: boolean;
  is_verified: boolean;
  last_active_at: string | null;
  created_at: string;
  email: string | null;
}

const roleBadgeColors: Record<string, string> = {
  admin: "bg-[#c2185b]/20 text-[#c2185b] border-[#c2185b]/30",
  moderator: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  host: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  member: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const tierBadgeColors: Record<string, string> = {
  curious: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  explorer: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  connoisseur: "bg-[#d4a574]/20 text-[#d4a574] border-[#d4a574]/30",
};

export function UserTable() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [bannedFilter, setBannedFilter] = useState<string>("all");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");
  const perPage = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
      });
      if (search) params.set("search", search);
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (tierFilter !== "all") params.set("tier", tierFilter);
      if (bannedFilter !== "all") params.set("is_banned", bannedFilter);
      if (verifiedFilter !== "all") params.set("is_verified", verifiedFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotalCount(data.totalCount);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, tierFilter, bannedFilter, verifiedFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const totalPages = Math.ceil(totalCount / perPage);

  const handleQuickAction = async (
    userId: string,
    action: "ban" | "unban" | "verify" | "unverify"
  ) => {
    try {
      const body: Record<string, unknown> = {};
      switch (action) {
        case "ban":
          body.is_banned = true;
          body.ban_reason = "Banned by admin";
          break;
        case "unban":
          body.is_banned = false;
          break;
        case "verify":
          body.is_verified = true;
          break;
        case "unverify":
          body.is_verified = false;
          break;
      }

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error("Quick action failed:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <MagnifyingGlass weight="light" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-white/[0.03] border-white/[0.08] text-zinc-200 placeholder:text-zinc-600"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[130px] bg-white/[0.03] border-white/[0.08] text-zinc-300">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="host">Host</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tierFilter} onValueChange={(v) => { setTierFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px] bg-white/[0.03] border-white/[0.08] text-zinc-300">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="curious">Curious</SelectItem>
              <SelectItem value="explorer">Explorer</SelectItem>
              <SelectItem value="connoisseur">Connoisseur</SelectItem>
            </SelectContent>
          </Select>

          <Select value={bannedFilter} onValueChange={(v) => { setBannedFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[130px] bg-white/[0.03] border-white/[0.08] text-zinc-300">
              <SelectValue placeholder="Banned" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Banned</SelectItem>
              <SelectItem value="false">Not Banned</SelectItem>
            </SelectContent>
          </Select>

          <Select value={verifiedFilter} onValueChange={(v) => { setVerifiedFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[130px] bg-white/[0.03] border-white/[0.08] text-zinc-300">
              <SelectValue placeholder="Verified" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Verified</SelectItem>
              <SelectItem value="false">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Tier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Verified
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Last Active
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-3">
                      <Skeleton className="h-10 w-full bg-white/[0.03]" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user, i) => {
                  const initials = (user.display_name || "?")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-white/10">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-zinc-800 text-xs text-zinc-400">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-zinc-200">
                              {user.display_name || "Unnamed"}
                            </p>
                            <p className="text-xs text-zinc-600">
                              {user.email || user.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] capitalize",
                            roleBadgeColors[user.role] || roleBadgeColors.member
                          )}
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] capitalize",
                            tierBadgeColors[user.subscription_tier] || tierBadgeColors.curious
                          )}
                        >
                          {user.subscription_tier}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {user.is_verified ? (
                          <Check weight="bold" className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <X weight="bold" className="h-4 w-4 text-zinc-600" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {user.is_banned ? (
                          <Badge variant="destructive" className="text-[10px] bg-red-500/20 text-red-400 border-red-500/30">
                            Banned
                          </Badge>
                        ) : (
                          <span className="text-xs text-emerald-400">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-zinc-500">
                          {user.last_active_at
                            ? formatDistanceToNow(new Date(user.last_active_at), { addSuffix: true })
                            : "Never"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/[0.06]"
                            >
                              <DotsThree weight="bold" className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-zinc-900 border-zinc-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/users/${user.id}`)}
                              className="text-zinc-300 focus:bg-white/[0.06] focus:text-white"
                            >
                              <Eye weight="light" className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            {user.is_banned ? (
                              <DropdownMenuItem
                                onClick={() => handleQuickAction(user.id, "unban")}
                                className="text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-400"
                              >
                                <ShieldSlash weight="light" className="mr-2 h-4 w-4" />
                                Unban User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleQuickAction(user.id, "ban")}
                                className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                              >
                                <Prohibit weight="light" className="mr-2 h-4 w-4" />
                                Ban User
                              </DropdownMenuItem>
                            )}
                            {user.is_verified ? (
                              <DropdownMenuItem
                                onClick={() => handleQuickAction(user.id, "unverify")}
                                className="text-zinc-300 focus:bg-white/[0.06] focus:text-white"
                              >
                                <Shield weight="light" className="mr-2 h-4 w-4" />
                                Remove Verification
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleQuickAction(user.id, "verify")}
                                className="text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-400"
                              >
                                <Shield weight="light" className="mr-2 h-4 w-4" />
                                Verify User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
            <span className="text-xs text-zinc-500">
              Showing {(page - 1) * perPage + 1}--{Math.min(page * perPage, totalCount)} of{" "}
              {totalCount}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-500 hover:text-white"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <CaretLeft weight="bold" className="h-4 w-4" />
              </Button>
              <span className="px-2 text-xs text-zinc-400">
                {page} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-500 hover:text-white"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <CaretRight weight="bold" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
