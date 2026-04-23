"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  ShieldCheck,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface HostApplication {
  id: string;
  applicant_id: string;
  experience_description: string;
  preferred_event_types: string[] | null;
  compensation_preference: string | null;
  status: string;
  review_notes: string | null;
  created_at: string;
  applicant: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    role: string;
    subscription_tier: string;
    is_verified: boolean;
  } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function HostApplications() {
  const [applications, setApplications] = useState<HostApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogApp, setDialogApp] = useState<HostApplication | null>(null);
  const [dialogAction, setDialogAction] = useState<"approve" | "reject">("approve");
  const [dialogNotes, setDialogNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const perPage = 20;

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
      });
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/hosts?${params}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications);
        setTotalCount(data.totalCount);
      }
    } catch (err) {
      console.error("Failed to fetch host applications:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleAction = async () => {
    if (!dialogApp) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/hosts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: dialogApp.id,
          action: dialogAction,
          notes: dialogNotes || undefined,
        }),
      });
      if (res.ok) {
        setDialogApp(null);
        setDialogNotes("");
        fetchApplications();
      }
    } catch (err) {
      console.error("Host action failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[150px] bg-white/[0.03] border-white/[0.08] text-zinc-300">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-xs text-zinc-500">
          {totalCount} application{totalCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Application cards */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-white/[0.03]" />
          ))
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] py-16">
            <ShieldCheck className="h-10 w-10 text-zinc-600" />
            <p className="mt-3 text-sm text-zinc-500">No applications found</p>
          </div>
        ) : (
          applications.map((app, i) => {
            const isExpanded = expandedId === app.id;
            const initials = (app.applicant?.display_name || "?")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]"
              >
                <div className="flex items-center gap-4 p-4">
                  <Avatar className="h-12 w-12 border border-white/10">
                    <AvatarImage src={app.applicant?.avatar_url || undefined} />
                    <AvatarFallback className="bg-zinc-800 text-sm text-zinc-400">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-200 truncate">
                        {app.applicant?.display_name || "Unknown"}
                      </p>
                      {app.applicant?.is_verified && (
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px] capitalize bg-zinc-500/20 text-zinc-400 border-zinc-500/30">
                        {app.applicant?.role}
                      </Badge>
                      <span className="text-xs text-zinc-600">
                        {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <Badge variant="outline" className={cn("text-[10px] capitalize shrink-0", statusColors[app.status])}>
                    {app.status}
                  </Badge>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/[0.06] p-4 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
                          Experience
                        </p>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                          {app.experience_description || "No description provided."}
                        </p>
                      </div>

                      {app.preferred_event_types && app.preferred_event_types.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
                            Preferred Event Types
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {app.preferred_event_types.map((type) => (
                              <Badge
                                key={type}
                                variant="outline"
                                className="text-[10px] capitalize bg-[#c2185b]/10 text-[#c2185b] border-[#c2185b]/20"
                              >
                                {type.replace(/_/g, " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {app.compensation_preference && (
                        <div>
                          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
                            Compensation Preference
                          </p>
                          <p className="text-sm text-zinc-400 capitalize">
                            {app.compensation_preference.replace(/_/g, " ")}
                          </p>
                        </div>
                      )}

                      {app.status === "pending" && (
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => {
                              setDialogApp(app);
                              setDialogAction("approve");
                              setDialogNotes("");
                            }}
                          >
                            <Check className="mr-1 h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/[0.03] border-white/[0.08] text-zinc-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                            onClick={() => {
                              setDialogApp(app);
                              setDialogAction("reject");
                              setDialogNotes("");
                            }}
                          >
                            <X className="mr-1 h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={!!dialogApp} onOpenChange={(open) => !open && setDialogApp(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-200">
              {dialogAction === "approve" ? "Approve" : "Reject"} Host Application
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              {dialogAction === "approve"
                ? `This will approve ${dialogApp?.applicant?.display_name}'s application and upgrade their role to host.`
                : `This will reject ${dialogApp?.applicant?.display_name}'s application.`}
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Add notes (optional)..."
            value={dialogNotes}
            onChange={(e) => setDialogNotes(e.target.value)}
            className="bg-white/[0.03] border-white/[0.08] text-zinc-200 placeholder:text-zinc-600"
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogApp(null)}
              className="bg-white/[0.03] border-white/[0.08] text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={submitting}
              className={cn(
                dialogAction === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              )}
            >
              {submitting ? "Processing..." : dialogAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
