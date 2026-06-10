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
  ArrowLeft,
  Prohibit,
  CalendarDots,
  Check,
  MapPin,
  ShieldCheck,
  ShieldSlash,
  User,
} from "@phosphor-icons/react/ssr";
import { format, formatDistanceToNow } from "date-fns";

interface UserDetail {
  profile: Record<string, unknown>;
  photos: Array<{ id: string; url: string; is_primary: boolean; order: number }>;
  interests: Array<{
    interest_id: string;
    level: string;
    interests: { id: string; name: string; category: string; emoji: string } | null;
  }>;
  matchCount: number;
  reportsAsReporter: Array<{ id: string; category: string; severity: string; status: string; created_at: string }>;
  reportsAsReported: Array<{ id: string; category: string; severity: string; status: string; created_at: string }>;
  payments: Array<{ id: string; amount_cents: number; currency: string; status: string; description: string; created_at: string }>;
}

export function UserDetailClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/admin/users/${userId}`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId]);

  const handleUpdate = async (updates: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        setData((prev) => prev ? { ...prev, profile: json.profile } : prev);
        setBanDialogOpen(false);
        setBanReason("");
      }
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-white/[0.03]" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[300px] rounded-xl bg-white/[0.03]" />
          <Skeleton className="col-span-2 h-[300px] rounded-xl bg-white/[0.03]" />
        </div>
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-zinc-500">User not found</p>
        <Button variant="ghost" className="mt-4 text-zinc-400" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const p = data.profile as Record<string, unknown>;
  const displayName = (p.display_name as string) || "Unnamed";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const isBanned = p.is_banned as boolean;
  const isVerified = p.is_verified as boolean;
  const role = (p.role as string) || "member";
  const tier = (p.subscription_tier as string) || "curious";

  return (
    <div className="space-y-6">
      {/* Back button + header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-white hover:bg-white/[0.06]"
          onClick={() => router.push("/admin/users")}
        >
          <ArrowLeft weight="bold" className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{displayName}</h1>
          <p className="text-sm text-zinc-500">User ID: {userId.slice(0, 8)}...</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
        >
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-20 w-20 border-2 border-white/10">
              <AvatarImage src={(p.avatar_url as string) || undefined} />
              <AvatarFallback className="bg-zinc-800 text-lg text-zinc-400">{initials}</AvatarFallback>
            </Avatar>
            <h2 className="mt-3 text-lg font-semibold text-zinc-200">{displayName}</h2>
            <p className="text-xs text-zinc-500">{(p.email as string) || "No email"}</p>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className={cn("text-[10px] capitalize",
                role === "admin" ? "bg-[#c2185b]/20 text-[#c2185b] border-[#c2185b]/30" :
                role === "host" ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" :
                "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
              )}>
                {role}
              </Badge>
              <Badge variant="outline" className={cn("text-[10px] capitalize",
                tier === "connoisseur" ? "bg-[#d4a574]/20 text-[#d4a574] border-[#d4a574]/30" :
                tier === "explorer" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
              )}>
                {tier}
              </Badge>
              {isVerified && (
                <Badge variant="outline" className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Verified
                </Badge>
              )}
              {isBanned && (
                <Badge variant="outline" className="text-[10px] bg-red-500/20 text-red-400 border-red-500/30">
                  Banned
                </Badge>
              )}
            </div>
          </div>

          <Separator className="my-4 bg-white/[0.06]" />

          <div className="space-y-2 text-sm">
            {typeof p.gender === "string" && p.gender && (
              <div className="flex items-center gap-2 text-zinc-400">
                <User weight="light" className="h-3.5 w-3.5 text-zinc-600" />
                <span className="capitalize">{p.gender}</span>
              </div>
            )}
            {typeof p.location === "string" && p.location && (
              <div className="flex items-center gap-2 text-zinc-400">
                <MapPin weight="light" className="h-3.5 w-3.5 text-zinc-600" />
                <span>{p.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-zinc-400">
              <CalendarDots weight="light" className="h-3.5 w-3.5 text-zinc-600" />
              <span>Joined {p.created_at ? format(new Date(p.created_at as string), "MMM dd, yyyy") : "Unknown"}</span>
            </div>
          </div>

          <Separator className="my-4 bg-white/[0.06]" />

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-white">{data.matchCount}</p>
              <p className="text-[10px] text-zinc-600">Matches</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{data.reportsAsReported.length}</p>
              <p className="text-[10px] text-zinc-600">Reports</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{data.photos.length}</p>
              <p className="text-[10px] text-zinc-600">Photos</p>
            </div>
          </div>
        </motion.div>

        {/* Actions + Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Admin Actions */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h3 className="mb-4 text-sm font-semibold text-zinc-300">Moderation Actions</h3>
            <div className="flex flex-wrap gap-3">
              {/* Role Change */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Role:</span>
                <Select
                  value={role}
                  onValueChange={(v) => handleUpdate({ role: v })}
                >
                  <SelectTrigger className="w-[130px] h-8 text-xs bg-white/[0.03] border-white/[0.08] text-zinc-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="host">Host</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tier Change */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Tier:</span>
                <Select
                  value={tier}
                  onValueChange={(v) => handleUpdate({ subscription_tier: v })}
                >
                  <SelectTrigger className="w-[140px] h-8 text-xs bg-white/[0.03] border-white/[0.08] text-zinc-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="curious">Curious</SelectItem>
                    <SelectItem value="explorer">Explorer</SelectItem>
                    <SelectItem value="connoisseur">Connoisseur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Verify */}
              {isVerified ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-zinc-400"
                  onClick={() => handleUpdate({ is_verified: false })}
                >
                  <ShieldSlash weight="light" className="mr-1 h-3.5 w-3.5" />
                  Remove Verification
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleUpdate({ is_verified: true })}
                >
                  <ShieldCheck weight="light" className="mr-1 h-3.5 w-3.5" />
                  Verify User
                </Button>
              )}

              {/* Ban/Unban */}
              {isBanned ? (
                <Button
                  size="sm"
                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleUpdate({ is_banned: false })}
                >
                  <Check weight="bold" className="mr-1 h-3.5 w-3.5" />
                  Unban User
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 text-xs"
                  onClick={() => setBanDialogOpen(true)}
                >
                  <Prohibit weight="light" className="mr-1 h-3.5 w-3.5" />
                  Ban User
                </Button>
              )}
            </div>
          </div>

          {/* Reports History */}
          {data.reportsAsReported.length > 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h3 className="mb-3 text-sm font-semibold text-zinc-300">
                Reports Against This User ({data.reportsAsReported.length})
              </h3>
              <div className="space-y-2">
                {data.reportsAsReported.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors hover:bg-white/[0.03] cursor-pointer"
                    onClick={() => router.push(`/admin/reports/${report.id}`)}
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] capitalize",
                        report.severity === "critical" ? "bg-red-500/10 text-red-400" :
                        report.severity === "high" ? "bg-orange-500/10 text-orange-400" :
                        "bg-zinc-500/10 text-zinc-400"
                      )}
                    >
                      {report.severity}
                    </Badge>
                    <span className="capitalize text-zinc-400">{report.category}</span>
                    <Badge variant="outline" className="text-[9px] capitalize bg-zinc-500/10 text-zinc-500 ml-auto">
                      {report.status}
                    </Badge>
                    <span className="text-zinc-600">
                      {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment History */}
          {data.payments.length > 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h3 className="mb-3 text-sm font-semibold text-zinc-300">
                Payment History ({data.payments.length})
              </h3>
              <div className="space-y-2">
                {data.payments.slice(0, 10).map((payment) => (
                  <div key={payment.id} className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs">
                    <span className="font-medium text-[#d4a574]">
                      ${(payment.amount_cents / 100).toFixed(2)}
                    </span>
                    <span className="text-zinc-400">{payment.description || "Payment"}</span>
                    <Badge variant="outline" className={cn("text-[9px] capitalize ml-auto",
                      payment.status === "succeeded" ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-500/10 text-zinc-400"
                    )}>
                      {payment.status}
                    </Badge>
                    <span className="text-zinc-600">
                      {format(new Date(payment.created_at), "MMM dd, yyyy")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-200">Ban {displayName}</DialogTitle>
            <DialogDescription className="text-zinc-500">
              This will prevent the user from accessing the platform. They will be notified.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for ban..."
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            className="bg-white/[0.03] border-white/[0.08] text-zinc-200 placeholder:text-zinc-600"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBanDialogOpen(false)}
              className="bg-white/[0.03] border-white/[0.08] text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleUpdate({ is_banned: true, ban_reason: banReason || "Banned by admin" })}
              disabled={submitting}
            >
              {submitting ? "Banning..." : "Ban User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
