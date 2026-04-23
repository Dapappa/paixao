import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/verify-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  format,
  subDays,
  subMonths,
  subYears,
  startOfDay,
  startOfWeek,
  startOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from "date-fns";

type Period = "7d" | "30d" | "90d" | "1y";

function getPeriodConfig(period: Period) {
  const now = new Date();

  switch (period) {
    case "7d":
      return {
        start: subDays(now, 7),
        groupBy: "day" as const,
        intervals: eachDayOfInterval({ start: subDays(now, 7), end: now }),
        formatKey: (d: Date) => format(d, "yyyy-MM-dd"),
        formatLabel: (d: Date) => format(d, "MMM dd"),
      };
    case "30d":
      return {
        start: subDays(now, 30),
        groupBy: "day" as const,
        intervals: eachDayOfInterval({ start: subDays(now, 30), end: now }),
        formatKey: (d: Date) => format(d, "yyyy-MM-dd"),
        formatLabel: (d: Date) => format(d, "MMM dd"),
      };
    case "90d":
      return {
        start: subDays(now, 90),
        groupBy: "week" as const,
        intervals: eachWeekOfInterval({ start: subDays(now, 90), end: now }),
        formatKey: (d: Date) => format(startOfWeek(d), "yyyy-MM-dd"),
        formatLabel: (d: Date) => format(d, "MMM dd"),
      };
    case "1y":
      return {
        start: subYears(now, 1),
        groupBy: "month" as const,
        intervals: eachMonthOfInterval({ start: subMonths(now, 11), end: now }),
        formatKey: (d: Date) => format(startOfMonth(d), "yyyy-MM"),
        formatLabel: (d: Date) => format(d, "MMM yyyy"),
      };
    default:
      return getPeriodConfig("30d");
  }
}

function groupRows(
  rows: { created_at: string }[],
  config: ReturnType<typeof getPeriodConfig>
) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const date = new Date(row.created_at);
    let key: string;
    if (config.groupBy === "month") {
      key = format(date, "yyyy-MM");
    } else if (config.groupBy === "week") {
      key = format(startOfWeek(date), "yyyy-MM-dd");
    } else {
      key = format(startOfDay(date), "yyyy-MM-dd");
    }
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return config.intervals.map((d) => ({
    date: config.formatLabel(d),
    count: counts.get(config.formatKey(d)) || 0,
  }));
}

function groupRevenue(
  rows: { created_at: string; amount_cents: number }[],
  config: ReturnType<typeof getPeriodConfig>
) {
  const sums = new Map<string, number>();

  for (const row of rows) {
    const date = new Date(row.created_at);
    let key: string;
    if (config.groupBy === "month") {
      key = format(date, "yyyy-MM");
    } else if (config.groupBy === "week") {
      key = format(startOfWeek(date), "yyyy-MM-dd");
    } else {
      key = format(startOfDay(date), "yyyy-MM-dd");
    }
    sums.set(key, (sums.get(key) || 0) + (row.amount_cents || 0));
  }

  return config.intervals.map((d) => ({
    date: config.formatLabel(d),
    count: sums.get(config.formatKey(d)) || 0,
  }));
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const admin = createAdminClient();
    const url = new URL(req.url);
    const period = (url.searchParams.get("period") || "30d") as Period;
    const config = getPeriodConfig(period);
    const startIso = config.start.toISOString();

    // Fetch all raw data in parallel
    const [usersRes, eventsRes, matchesRes, messagesRes, revenueRes] = await Promise.all([
      (admin.from("profiles") as any)
        .select("created_at")
        .gte("created_at", startIso)
        .order("created_at", { ascending: true }),
      (admin.from("events") as any)
        .select("created_at")
        .gte("created_at", startIso)
        .order("created_at", { ascending: true }),
      (admin.from("matches") as any)
        .select("created_at")
        .gte("created_at", startIso)
        .order("created_at", { ascending: true }),
      (admin.from("messages") as any)
        .select("created_at")
        .gte("created_at", startIso)
        .order("created_at", { ascending: true })
        .limit(5000),
      (admin.from("payments") as any)
        .select("created_at, amount_cents")
        .gte("created_at", startIso)
        .order("created_at", { ascending: true }),
    ]);

    return NextResponse.json({
      period,
      new_users: groupRows(usersRes.data || [], config),
      events_created: groupRows(eventsRes.data || [], config),
      matches_formed: groupRows(matchesRes.data || [], config),
      messages_sent: groupRows(messagesRes.data || [], config),
      revenue_cents: groupRevenue(revenueRes.data || [], config),
    });
  } catch (err) {
    console.error("Admin analytics GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
