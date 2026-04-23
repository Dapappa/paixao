"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Search,
  Star,
  StarOff,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  event_type: string;
  status: string;
  is_featured: boolean;
  starts_at: string;
  capacity: number | null;
  current_attendees: number;
  created_at: string;
  host: { id: string; display_name: string; avatar_url: string | null } | null;
}

const statusBadge: Record<string, string> = {
  draft: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  published: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  rejected: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export function EventManager() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const perPage = 20;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
      });

      if (tab === "pending") params.set("status", "draft");
      if (tab === "featured") params.set("is_featured", "true");
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/events?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events);
        setTotalCount(data.totalCount);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  }, [page, tab, search]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleAction = async (
    eventId: string,
    action: "approve" | "reject" | "feature" | "unfeature" | "cancel"
  ) => {
    try {
      const res = await fetch("/api/admin/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventIds: [eventId], action }),
      });
      if (res.ok) fetchEvents();
    } catch (err) {
      console.error("Event action failed:", err);
    }
  };

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="space-y-4">
      {/* Tabs and search */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(1); }}>
          <TabsList className="bg-white/[0.04] border border-white/[0.06]">
            <TabsTrigger
              value="all"
              className="text-xs data-[state=active]:bg-[#c2185b]/20 data-[state=active]:text-[#c2185b]"
            >
              All Events
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="text-xs data-[state=active]:bg-[#c2185b]/20 data-[state=active]:text-[#c2185b]"
            >
              Pending Approval
            </TabsTrigger>
            <TabsTrigger
              value="featured"
              className="text-xs data-[state=active]:bg-[#c2185b]/20 data-[state=active]:text-[#c2185b]"
            >
              Featured
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search events..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-white/[0.03] border-white/[0.08] text-zinc-200 placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Event
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Host
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Attendees
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Featured
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
                    <td colSpan={8} className="px-4 py-3">
                      <Skeleton className="h-10 w-full bg-white/[0.03]" />
                    </td>
                  </tr>
                ))
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                    No events found.
                  </td>
                </tr>
              ) : (
                events.map((event, i) => (
                  <motion.tr
                    key={event.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                    onClick={() => router.push(`/admin/events/${event.id}`)}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-zinc-200 truncate max-w-[200px]">
                        {event.title}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={event.host?.avatar_url || undefined} />
                          <AvatarFallback className="bg-zinc-800 text-[8px] text-zinc-400">
                            {(event.host?.display_name || "?")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-zinc-400 truncate max-w-[100px]">
                          {event.host?.display_name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs capitalize text-zinc-400">
                        {event.event_type?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-zinc-400">
                        {event.starts_at
                          ? format(new Date(event.starts_at), "MMM dd, yyyy")
                          : "TBD"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] capitalize",
                          statusBadge[event.status] || statusBadge.draft
                        )}
                      >
                        {event.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <Users className="h-3 w-3" />
                        <span>
                          {event.current_attendees}
                          {event.capacity ? `/${event.capacity}` : ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(
                            event.id,
                            event.is_featured ? "unfeature" : "feature"
                          );
                        }}
                        className="inline-flex"
                      >
                        {event.is_featured ? (
                          <Star className="h-4 w-4 fill-[#d4a574] text-[#d4a574]" />
                        ) : (
                          <Star className="h-4 w-4 text-zinc-600 hover:text-[#d4a574] transition-colors" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/[0.06]"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-zinc-900 border-zinc-800"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/events/${event.id}`)}
                            className="text-zinc-300 focus:bg-white/[0.06] focus:text-white"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {event.status === "draft" && (
                            <>
                              <DropdownMenuSeparator className="bg-zinc-800" />
                              <DropdownMenuItem
                                onClick={() => handleAction(event.id, "approve")}
                                className="text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-400"
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAction(event.id, "reject")}
                                className="text-orange-400 focus:bg-orange-500/10 focus:text-orange-400"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {event.status === "published" && (
                            <>
                              <DropdownMenuSeparator className="bg-zinc-800" />
                              <DropdownMenuItem
                                onClick={() => handleAction(event.id, "cancel")}
                                className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Event
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
            <span className="text-xs text-zinc-500">
              Page {page} of {totalPages} ({totalCount} events)
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-500"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-500"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
