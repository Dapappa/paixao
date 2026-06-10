"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  Clock,
  Eye,
  MagnifyingGlass as SearchIcon,
  XCircle,
} from "@phosphor-icons/react/ssr";
import { formatDistanceToNow } from "date-fns";

interface Report {
  id: string;
  category: string;
  severity: string;
  status: string;
  description: string;
  created_at: string;
  reporter: { id: string; display_name: string; avatar_url: string | null } | null;
  reported_user: { id: string; display_name: string; avatar_url: string | null } | null;
}

const severityConfig: Record<string, { color: string; border: string; bg: string }> = {
  critical: {
    color: "text-red-400",
    border: "border-l-red-500",
    bg: "bg-red-500/10",
  },
  high: {
    color: "text-orange-400",
    border: "border-l-orange-500",
    bg: "bg-orange-500/10",
  },
  medium: {
    color: "text-yellow-400",
    border: "border-l-yellow-500",
    bg: "bg-yellow-500/10",
  },
  low: {
    color: "text-zinc-400",
    border: "border-l-zinc-500",
    bg: "bg-zinc-500/10",
  },
};

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  pending: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Clock },
  investigating: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: SearchIcon },
  resolved: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  dismissed: { color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30", icon: XCircle },
};

export function ReportQueue() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const perPage = 20;

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
      });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (severityFilter !== "all") params.set("severity", severityFilter);

      const res = await fetch(`/api/admin/reports?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
        setTotalCount(data.totalCount);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, severityFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleQuickResolve = async (reportId: string, action: "resolved" | "dismissed") => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action,
          resolution_action: action === "dismissed" ? "dismissed" : "warning",
        }),
      });
      if (res.ok) {
        fetchReports();
      }
    } catch (err) {
      console.error("Quick resolve failed:", err);
    }
  };

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[150px] bg-white/[0.03] border-white/[0.08] text-zinc-300">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[150px] bg-white/[0.03] border-white/[0.08] text-zinc-300">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <span className="ml-auto text-xs text-zinc-500">
          {totalCount} report{totalCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Report list */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl bg-white/[0.03]" />
          ))
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] py-16">
            <CheckCircle weight="duotone" className="h-10 w-10 text-emerald-400/40" />
            <p className="mt-3 text-sm text-zinc-500">No reports found</p>
          </div>
        ) : (
          reports.map((report, i) => {
            const sev = severityConfig[report.severity] || severityConfig.low;
            const stat = statusConfig[report.status] || statusConfig.pending;
            const isExpanded = expandedId === report.id;

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  "overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] border-l-4",
                  sev.border,
                  report.severity === "critical" && report.status === "pending" && "animate-pulse"
                )}
              >
                <div
                  className="flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors hover:bg-white/[0.02]"
                  onClick={() => setExpandedId(isExpanded ? null : report.id)}
                >
                  {/* Severity badge */}
                  <Badge variant="outline" className={cn("text-[10px] capitalize shrink-0", sev.bg, sev.color)}>
                    {report.severity}
                  </Badge>

                  {/* Category */}
                  <span className="text-sm font-medium capitalize text-zinc-300 shrink-0">
                    {report.category}
                  </span>

                  {/* Reporter -> Reported */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="truncate text-xs text-zinc-400">
                      {report.reporter?.display_name || "Unknown"}
                    </span>
                    <ArrowRight weight="bold" className="h-3 w-3 shrink-0 text-zinc-600" />
                    <span className="truncate text-xs text-zinc-400">
                      {report.reported_user?.display_name || "Unknown"}
                    </span>
                  </div>

                  {/* Date */}
                  <span className="text-xs text-zinc-600 shrink-0 hidden md:block">
                    {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                  </span>

                  {/* Status badge */}
                  <Badge variant="outline" className={cn("text-[10px] capitalize shrink-0", stat.color)}>
                    {report.status}
                  </Badge>

                  {/* Expand */}
                  {isExpanded ? (
                    <CaretUp weight="bold" className="h-4 w-4 text-zinc-500 shrink-0" />
                  ) : (
                    <CaretDown weight="bold" className="h-4 w-4 text-zinc-500 shrink-0" />
                  )}
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/[0.06] px-4 py-3 space-y-3">
                        <p className="text-sm text-zinc-400 leading-relaxed">
                          {report.description || "No description provided."}
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs bg-white/[0.03] border-white/[0.08] text-zinc-300 hover:bg-white/[0.06]"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/reports/${report.id}`);
                            }}
                          >
                            <Eye weight="light" className="mr-1 h-3 w-3" />
                            View Full Report
                          </Button>

                          {report.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickResolve(report.id, "resolved");
                                }}
                              >
                                <CheckCircle weight="fill" className="mr-1 h-3 w-3" />
                                Resolve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:bg-white/[0.06]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickResolve(report.id, "dismissed");
                                }}
                              >
                                <XCircle weight="light" className="mr-1 h-3 w-3" />
                                Dismiss
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-500"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <CaretLeft weight="bold" className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-500"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <CaretRight weight="bold" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
