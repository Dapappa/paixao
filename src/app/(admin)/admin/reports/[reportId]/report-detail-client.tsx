"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Eye,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface ReportDetail {
  id: string;
  category: string;
  severity: string;
  status: string;
  description: string;
  evidence_urls: string[] | null;
  resolution_action: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  reporter: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    role: string;
    subscription_tier: string;
    is_verified: boolean;
    created_at: string;
  } | null;
  reported_user: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    role: string;
    subscription_tier: string;
    is_verified: boolean;
    is_banned: boolean;
    created_at: string;
  } | null;
}

const severityConfig: Record<string, { color: string; bg: string }> = {
  critical: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
  high: { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
  medium: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  low: { color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/30" },
};

const statusConfig: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  investigating: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  resolved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  dismissed: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export function ReportDetailClient({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolutionStatus, setResolutionStatus] = useState("");
  const [resolutionAction, setResolutionAction] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/admin/reports/${reportId}`);
        if (res.ok) {
          const data = await res.json();
          setReport(data.report);
          if (data.report.status) setResolutionStatus(data.report.status);
          if (data.report.resolution_action) setResolutionAction(data.report.resolution_action);
          if (data.report.resolution_notes) setResolutionNotes(data.report.resolution_notes);
        }
      } catch (err) {
        console.error("Failed to fetch report:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [reportId]);

  const handleResolve = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: resolutionStatus,
          resolution_action: resolutionAction || undefined,
          resolution_notes: resolutionNotes || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setReport((prev) => (prev ? { ...prev, ...data.report } : prev));
      }
    } catch (err) {
      console.error("Resolve failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-white/[0.03]" />
        <Skeleton className="h-[400px] rounded-xl bg-white/[0.03]" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-zinc-500">Report not found</p>
        <Button variant="ghost" className="mt-4 text-zinc-400" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const sev = severityConfig[report.severity] || severityConfig.low;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-white hover:bg-white/[0.06]"
          onClick={() => router.push("/admin/reports")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-white capitalize">
            {report.category} Report
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="outline" className={cn("text-[10px] capitalize", sev.bg, sev.color)}>
              {report.severity}
            </Badge>
            <Badge variant="outline" className={cn("text-[10px] capitalize", statusConfig[report.status])}>
              {report.status}
            </Badge>
            <span className="text-xs text-zinc-600">
              {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reporter & Reported side by side */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Reporter */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                Reporter
              </p>
              <UserCard
                user={report.reporter}
                onViewProfile={() => report.reporter && router.push(`/admin/users/${report.reporter.id}`)}
              />
            </motion.div>

            {/* Arrow */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                Reported User
              </p>
              <UserCard
                user={report.reported_user}
                onViewProfile={() => report.reported_user && router.push(`/admin/users/${report.reported_user.id}`)}
              />
            </motion.div>
          </div>

          {/* Description / Evidence */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4"
          >
            <h3 className="text-sm font-semibold text-zinc-300">Report Description</h3>
            <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {report.description || "No description provided."}
            </p>

            {report.evidence_urls && report.evidence_urls.length > 0 && (
              <>
                <Separator className="bg-white/[0.06]" />
                <div>
                  <h4 className="mb-2 text-xs font-semibold text-zinc-500">Evidence</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {report.evidence_urls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square rounded-lg border border-white/[0.06] bg-zinc-800 overflow-hidden hover:border-white/[0.12] transition-colors"
                      >
                        <img src={url} alt={`Evidence ${i + 1}`} className="h-full w-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Resolution info if already resolved */}
            {report.resolved_at && (
              <>
                <Separator className="bg-white/[0.06]" />
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-zinc-500">Resolution</h4>
                  <div className="text-sm text-zinc-400">
                    <p>
                      Action: <span className="capitalize text-zinc-300">{report.resolution_action || "None"}</span>
                    </p>
                    {report.resolution_notes && (
                      <p className="mt-1">Notes: {report.resolution_notes}</p>
                    )}
                    <p className="mt-1 text-xs text-zinc-600">
                      Resolved {formatDistanceToNow(new Date(report.resolved_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* Resolution form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4 h-fit"
        >
          <h3 className="text-sm font-semibold text-zinc-300">Resolution</h3>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Status</label>
              <Select value={resolutionStatus} onValueChange={setResolutionStatus}>
                <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-zinc-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-zinc-500">Action</label>
              <Select value={resolutionAction} onValueChange={setResolutionAction}>
                <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-zinc-300">
                  <SelectValue placeholder="Select action..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="temp_ban">Temporary Ban</SelectItem>
                  <SelectItem value="perm_ban">Permanent Ban</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-zinc-500">Notes</label>
              <Textarea
                placeholder="Add resolution notes..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
                className="bg-white/[0.03] border-white/[0.08] text-zinc-200 placeholder:text-zinc-600"
              />
            </div>

            <Button
              className="w-full bg-[#c2185b] hover:bg-[#c2185b]/90 text-white"
              onClick={handleResolve}
              disabled={submitting}
            >
              {submitting ? "Updating..." : "Update Report"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function UserCard({
  user,
  onViewProfile,
}: {
  user: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    role: string;
    subscription_tier: string;
    is_verified: boolean;
    created_at: string;
  } | null;
  onViewProfile: () => void;
}) {
  if (!user) {
    return <p className="text-sm text-zinc-600">User not found</p>;
  }

  const initials = user.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border border-white/10">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback className="bg-zinc-800 text-sm text-zinc-400">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-zinc-200">{user.display_name}</p>
            {user.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant="outline" className="text-[9px] capitalize bg-zinc-500/10 text-zinc-500 border-zinc-500/30">
              {user.role}
            </Badge>
            <Badge variant="outline" className="text-[9px] capitalize bg-zinc-500/10 text-zinc-500 border-zinc-500/30">
              {user.subscription_tier}
            </Badge>
          </div>
        </div>
      </div>
      <div className="text-xs text-zinc-600">
        <Calendar className="mr-1 inline h-3 w-3" />
        Joined {format(new Date(user.created_at), "MMM yyyy")}
      </div>
      <Button
        size="sm"
        variant="outline"
        className="w-full h-7 text-xs bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:bg-white/[0.06]"
        onClick={onViewProfile}
      >
        <Eye className="mr-1 h-3 w-3" />
        View Full Profile
      </Button>
    </div>
  );
}
