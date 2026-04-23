"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type Period = "7d" | "30d" | "90d" | "1y";

interface TimeSeries {
  date: string;
  count: number;
}

interface AnalyticsData {
  period: string;
  new_users: TimeSeries[];
  events_created: TimeSeries[];
  matches_formed: TimeSeries[];
  messages_sent: TimeSeries[];
  revenue_cents: TimeSeries[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
  formatValue,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  formatValue?: (v: number) => string;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-white/[0.08] bg-zinc-900/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="mb-1 text-xs text-zinc-500">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-zinc-400">{p.name}:</span>
          <span className="font-medium text-zinc-200">
            {formatValue ? formatValue(p.value) : p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

const chartCommon = {
  grid: { stroke: "#262626", strokeDasharray: "3 3" },
  xAxis: { stroke: "#404040", fontSize: 11, tick: { fill: "#666" } },
  yAxis: { stroke: "#404040", fontSize: 11, tick: { fill: "#666" } },
};

export function AnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("30d");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(v / 100);

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-200">Platform Analytics</h2>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList className="bg-white/[0.04] border border-white/[0.06]">
            {(["7d", "30d", "90d", "1y"] as Period[]).map((p) => (
              <TabsTrigger
                key={p}
                value={p}
                className="text-xs data-[state=active]:bg-[#c2185b]/20 data-[state=active]:text-[#c2185b]"
              >
                {p}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[300px] rounded-xl bg-white/[0.03]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* New Users - Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <h3 className="mb-4 text-sm font-medium text-zinc-400">New Users</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data?.new_users || []}>
                <CartesianGrid {...chartCommon.grid} />
                <XAxis dataKey="date" {...chartCommon.xAxis} />
                <YAxis {...chartCommon.yAxis} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Users"
                  stroke="#c2185b"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#c2185b", stroke: "#0a0a0a", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Events & Matches - Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <h3 className="mb-4 text-sm font-medium text-zinc-400">Events & Matches</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={(data?.events_created || []).map((e, i) => ({
                  date: e.date,
                  events: e.count,
                  matches: data?.matches_formed?.[i]?.count || 0,
                }))}
              >
                <CartesianGrid {...chartCommon.grid} />
                <XAxis dataKey="date" {...chartCommon.xAxis} />
                <YAxis {...chartCommon.yAxis} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) => <span className="text-zinc-400">{value}</span>}
                />
                <Bar dataKey="events" name="Events" fill="#c2185b" radius={[2, 2, 0, 0]} />
                <Bar dataKey="matches" name="Matches" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Messages - Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <h3 className="mb-4 text-sm font-medium text-zinc-400">Messages Sent</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data?.messages_sent || []}>
                <CartesianGrid {...chartCommon.grid} />
                <XAxis dataKey="date" {...chartCommon.xAxis} />
                <YAxis {...chartCommon.yAxis} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Messages"
                  stroke="#d4a574"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#d4a574", stroke: "#0a0a0a", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Revenue - Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <h3 className="mb-4 text-sm font-medium text-zinc-400">Revenue</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data?.revenue_cents || []}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4a574" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#d4a574" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...chartCommon.grid} />
                <XAxis dataKey="date" {...chartCommon.xAxis} />
                <YAxis
                  {...chartCommon.yAxis}
                  tickFormatter={(v) => `$${(v / 100).toFixed(0)}`}
                />
                <Tooltip content={<CustomTooltip formatValue={formatCurrency} />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Revenue"
                  stroke="#d4a574"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}
    </div>
  );
}
