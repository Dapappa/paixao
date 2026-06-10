"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminStatsCards } from "@/components/admin/admin-stats-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Warning,
  ArrowRight,
  CalendarDots,
  CaretRight,
  Shield,
  UserCheck,
  UsersThree,
} from "@phosphor-icons/react/ssr";
import { formatDistanceToNow, format } from "date-fns";

interface RecentReport {
  id: string;
  category: string;
  severity: string;
  status: string;
  created_at: string;
  reporter: { display_name: string } | null;
  reported_user: { display_name: string } | null;
}

interface UpcomingEvent {
  id: string;
  title: string;
  starts_at: string;
  status: string;
  current_attendees: number;
  host: { display_name: string } | null;
}

const severityColor: Record<string, string> = {
  critical: "text-red-400 bg-red-500/10",
  high: "text-orange-400 bg-orange-500/10",
  medium: "text-yellow-400 bg-yellow-500/10",
  low: "text-zinc-400 bg-zinc-500/10",
};

export function AdminDashboardClient() {
  const router = useRouter();
  const [reports, setReports] = useState<RecentReport[]>([]);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [reportsRes, eventsRes] = await Promise.all([
          fetch("/api/admin/reports?per_page=5&status=pending"),
          fetch("/api/admin/events?per_page=5&status=published"),
        ]);

        if (reportsRes.ok) {
          const data = await reportsRes.json();
          setReports(data.reports || []);
        }
        if (eventsRes.ok) {
          const data = await eventsRes.json();
          setEvents(data.events || []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Platform overview and quick actions</p>
      </div>

      {/* Stats Cards */}
      <AdminStatsCards />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          {
            label: "Manage Users",
            icon: UsersThree,
            href: "/admin/users",
            color: "text-blue-400",
            bg: "bg-blue-500/10 hover:bg-blue-500/15",
          },
          {
            label: "Review Reports",
            icon: Warning,
            href: "/admin/reports",
            color: "text-amber-400",
            bg: "bg-amber-500/10 hover:bg-amber-500/15",
          },
          {
            label: "Host Applications",
            icon: UserCheck,
            href: "/admin/hosts",
            color: "text-cyan-400",
            bg: "bg-cyan-500/10 hover:bg-cyan-500/15",
          },
          {
            label: "Verification Queue",
            icon: Shield,
            href: "/admin/verification",
            color: "text-violet-400",
            bg: "bg-violet-500/10 hover:bg-violet-500/15",
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.href}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(action.href)}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-white/[0.06] p-4 text-left transition-colors",
                action.bg
              )}
            >
              <Icon weight="duotone" className={cn("h-5 w-5 shrink-0", action.color)} />
              <span className="text-sm font-medium text-zinc-300">{action.label}</span>
              <CaretRight weight="bold" className="ml-auto h-4 w-4 text-zinc-600" />
            </motion.button>
          );
        })}
      </div>

      {/* Recent reports + upcoming events */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Reports */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-300">Pending Reports</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-zinc-500 hover:text-zinc-300"
              onClick={() => router.push("/admin/reports")}
            >
              View All
              <ArrowRight weight="bold" className="ml-1 h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 bg-white/[0.03]" />
              ))
            ) : reports.length === 0 ? (
              <p className="py-8 text-center text-xs text-zinc-600">No pending reports</p>
            ) : (
              reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => router.push(`/admin/reports/${report.id}`)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.03]"
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] capitalize shrink-0",
                      severityColor[report.severity] || severityColor.low
                    )}
                  >
                    {report.severity}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs text-zinc-300 capitalize">{report.category}</p>
                    <p className="truncate text-[10px] text-zinc-600">
                      {report.reporter?.display_name || "Unknown"} reported{" "}
                      {report.reported_user?.display_name || "Unknown"}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] text-zinc-600">
                    {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-300">Upcoming Events</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-zinc-500 hover:text-zinc-300"
              onClick={() => router.push("/admin/events")}
            >
              View All
              <ArrowRight weight="bold" className="ml-1 h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 bg-white/[0.03]" />
              ))
            ) : events.length === 0 ? (
              <p className="py-8 text-center text-xs text-zinc-600">No upcoming events</p>
            ) : (
              events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => router.push(`/admin/events/${event.id}`)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.03]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#c2185b]/10">
                    <CalendarDots weight="light" className="h-4 w-4 text-[#c2185b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium text-zinc-300">{event.title}</p>
                    <p className="truncate text-[10px] text-zinc-600">
                      by {event.host?.display_name || "Unknown"} -- {event.current_attendees} attendees
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] text-zinc-600">
                    {event.starts_at ? format(new Date(event.starts_at), "MMM dd") : "TBD"}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
