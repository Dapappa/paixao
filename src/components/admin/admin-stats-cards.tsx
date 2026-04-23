"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  UserCheck,
  Activity,
} from "lucide-react";

interface StatsData {
  totalUsers: number;
  activeUsers: number;
  pendingReports: number;
  pendingVerifications: number;
  pendingHostApplications: number;
  upcomingEvents: number;
  monthlyRevenueCents: number;
}

interface StatCardConfig {
  key: keyof StatsData;
  label: string;
  icon: typeof Users;
  color: string;
  gradient: string;
  iconBg: string;
  format?: (v: number) => string;
}

const statCards: StatCardConfig[] = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: Users,
    color: "text-blue-400",
    gradient: "from-blue-500/10 to-blue-500/5",
    iconBg: "bg-blue-500/10",
  },
  {
    key: "activeUsers",
    label: "Active (7d)",
    icon: Activity,
    color: "text-emerald-400",
    gradient: "from-emerald-500/10 to-emerald-500/5",
    iconBg: "bg-emerald-500/10",
  },
  {
    key: "upcomingEvents",
    label: "Upcoming Events",
    icon: Calendar,
    color: "text-[#c2185b]",
    gradient: "from-[#c2185b]/10 to-[#c2185b]/5",
    iconBg: "bg-[#c2185b]/10",
  },
  {
    key: "pendingReports",
    label: "Pending Reports",
    icon: AlertTriangle,
    color: "text-amber-400",
    gradient: "from-amber-500/10 to-amber-500/5",
    iconBg: "bg-amber-500/10",
  },
  {
    key: "pendingVerifications",
    label: "Pending Verifications",
    icon: ShieldCheck,
    color: "text-violet-400",
    gradient: "from-violet-500/10 to-violet-500/5",
    iconBg: "bg-violet-500/10",
  },
  {
    key: "pendingHostApplications",
    label: "Host Applications",
    icon: UserCheck,
    color: "text-cyan-400",
    gradient: "from-cyan-500/10 to-cyan-500/5",
    iconBg: "bg-cyan-500/10",
  },
  {
    key: "monthlyRevenueCents",
    label: "Revenue (Month)",
    icon: DollarSign,
    color: "text-[#d4a574]",
    gradient: "from-[#d4a574]/10 to-[#d4a574]/5",
    iconBg: "bg-[#d4a574]/10",
    format: (v: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      }).format(v / 100),
  },
];

export function AdminStatsCards() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-[120px] rounded-xl bg-white/[0.03]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-7">
      {statCards.map((card, i) => {
        const Icon = card.icon;
        const value = stats?.[card.key] ?? 0;
        const displayValue = card.format ? card.format(value) : value.toLocaleString();

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={cn(
              "relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-br p-4",
              card.gradient
            )}
          >
            <div className="flex items-start justify-between">
              <div className={cn("rounded-lg p-2", card.iconBg)}>
                <Icon className={cn("h-4 w-4", card.color)} />
              </div>
              {card.key === "pendingReports" && value > 0 && (
                <span className="flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
                </span>
              )}
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight text-white">
                {displayValue}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">{card.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
