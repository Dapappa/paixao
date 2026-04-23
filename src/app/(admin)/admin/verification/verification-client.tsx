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
  ChevronLeft,
  ChevronRight,
  Eye,
  ShieldCheck,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface VerificationSubmission {
  id: string;
  user_id: string;
  status: string;
  document_type: string | null;
  document_url: string | null;
  selfie_url: string | null;
  review_notes: string | null;
  created_at: string;
  user: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    is_verified: boolean;
  } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function VerificationPageClient() {
  const [submissions, setSubmissions] = useState<VerificationSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [dialogSub, setDialogSub] = useState<VerificationSubmission | null>(null);
  const [dialogAction, setDialogAction] = useState<"approve" | "reject">("approve");
  const [dialogNotes, setDialogNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const perPage = 20;

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      // Use admin client via a simple fetch to our admin users/stats endpoint
      // Since there's no dedicated verification API, we'll build inline
      const res = await fetch(
        `/api/admin/stats`
      );
      if (res.ok) {
        // For now, set empty since the verification API would be dedicated
        // We display the queue UI which connects when backend is ready
        setSubmissions([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Failed to fetch verifications:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Verification Queue</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Review identity verification submissions. Approve or reject with notes.
        </p>
      </div>

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
          {totalCount} submission{totalCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Submissions list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-white/[0.03]" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] py-16">
          <div className="rounded-full bg-emerald-500/10 p-4">
            <ShieldCheck className="h-10 w-10 text-emerald-400/40" />
          </div>
          <p className="mt-4 text-sm font-medium text-zinc-400">
            No pending verifications
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            All verification submissions have been processed.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub, i) => {
            const initials = (sub.user?.display_name || "?")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border border-white/10">
                    <AvatarImage src={sub.user?.avatar_url || undefined} />
                    <AvatarFallback className="bg-zinc-800 text-sm text-zinc-400">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200">
                      {sub.user?.display_name || "Unknown"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {sub.document_type && (
                        <span className="text-xs text-zinc-500 capitalize">
                          {sub.document_type.replace(/_/g, " ")}
                        </span>
                      )}
                      <span className="text-xs text-zinc-600">
                        {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <Badge variant="outline" className={cn("text-[10px] capitalize", statusColors[sub.status])}>
                    {sub.status}
                  </Badge>

                  {/* Quick view / action buttons */}
                  <div className="flex items-center gap-2">
                    {sub.document_url && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-zinc-500 hover:text-white"
                        onClick={() => window.open(sub.document_url!, "_blank")}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {sub.status === "pending" && (
                      <>
                        <Button
                          size="icon"
                          className="h-8 w-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => {
                            setDialogSub(sub);
                            setDialogAction("approve");
                            setDialogNotes("");
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 bg-white/[0.03] border-white/[0.08] text-red-400 hover:bg-red-500/10"
                          onClick={() => {
                            setDialogSub(sub);
                            setDialogAction("reject");
                            setDialogNotes("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

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
      <Dialog open={!!dialogSub} onOpenChange={(open) => !open && setDialogSub(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-200">
              {dialogAction === "approve" ? "Approve" : "Reject"} Verification
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              {dialogAction === "approve"
                ? `This will verify ${dialogSub?.user?.display_name}'s identity.`
                : `This will reject ${dialogSub?.user?.display_name}'s verification attempt.`}
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
              onClick={() => setDialogSub(null)}
              className="bg-white/[0.03] border-white/[0.08] text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              disabled={submitting}
              className={cn(
                dialogAction === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              )}
              onClick={() => {
                // Would call verification API here
                setDialogSub(null);
              }}
            >
              {submitting ? "Processing..." : dialogAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
