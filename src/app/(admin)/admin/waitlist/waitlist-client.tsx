"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LazyMotion, domAnimation, m } from "motion/react";
import {
  CaretLeft,
  CaretRight,
  Crown,
  MapPin,
  MagnifyingGlass,
  UsersThree,
} from "@phosphor-icons/react/ssr";
import { riseIn, riseInSoft, stagger } from "@/lib/motion";
import { formatDistanceToNow } from "date-fns";

interface WaitlistRow {
  id: string;
  email: string;
  city: string | null;
  interested_in: string[] | null;
  source: string | null;
  status: string;
  is_founding: boolean;
  amount_cents: number | null;
  currency: string | null;
  founding_paid_at: string | null;
  created_at: string;
}

const statusBadgeColors: Record<string, string> = {
  pending: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  founding: "bg-[#d4a574]/20 text-[#d4a574] border-[#d4a574]/30",
  converted: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

function formatAmount(cents: number | null, currency: string | null): string {
  if (cents === null) return "—";
  const value = (cents / 100).toFixed(0);
  return `${(currency || "cad").toUpperCase()} $${value}`;
}

export function WaitlistPageClient() {
  const [rows, setRows] = useState<WaitlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredCount, setFilteredCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [founderCount, setFounderCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const perPage = 20;

  const fetchWaitlist = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
      });
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/waitlist?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRows(data.signups);
        setFilteredCount(data.filteredCount);
        setTotalCount(data.totalCount);
        setFounderCount(data.founderCount);
      }
    } catch (err) {
      console.error("Failed to fetch waitlist:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchWaitlist();
  }, [fetchWaitlist]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const totalPages = Math.ceil(filteredCount / perPage);

  return (
    <LazyMotion features={domAnimation}>
      {/* ── Assigned atmosphere: bg-bar under aura + grain, scoped to this view ── */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.18]"
          style={{ backgroundImage: "url(/generated/bg-bar.webp)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
        <div className="aura-field absolute inset-0 opacity-40" />
        <div className="absolute right-[-8%] top-[-10%] h-[420px] w-[560px] rounded-full bg-gold/[0.05] blur-[130px]" />
        <div className="film-grain absolute inset-0" />
      </div>

      <m.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative space-y-6"
      >
        <m.div variants={riseIn} custom={0}>
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-gold">
            The list
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground">
            Who&apos;s <span className="text-gradient-gold">waiting</span>
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Pre-sale signups and the founding few who got here first.
          </p>
        </m.div>

        {/* Stat cards */}
        <m.div variants={riseIn} custom={1} className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/50 bg-surface/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:shadow-glow-accent">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-muted text-text-secondary">
                <UsersThree weight="duotone" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-text-secondary">
                  Total signups
                </p>
                <p className="font-serif text-2xl font-bold text-foreground">
                  {loading ? "—" : totalCount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/50 bg-surface/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-gold/30 hover:shadow-glow-accent">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold">
                <Crown weight="duotone" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-text-secondary">
                  Founding members
                </p>
                <p className="font-serif text-2xl font-bold text-foreground">
                  {loading ? "—" : founderCount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </m.div>

        {/* Filters */}
        <m.div
          variants={riseIn}
          custom={2}
          className="flex flex-col gap-3 md:flex-row md:items-center"
        >
          <div className="relative flex-1">
            <MagnifyingGlass weight="light" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              placeholder="Search by email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 bg-surface/40 border-border/60 text-foreground placeholder:text-text-secondary"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[150px] bg-surface/40 border-border/60 text-text-secondary">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-surface border-border">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="founding">Founding</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </SelectContent>
          </Select>
        </m.div>

        {/* Table */}
        <m.div
          variants={riseIn}
          custom={3}
          className="overflow-hidden rounded-2xl border border-border/50 bg-surface/40 backdrop-blur-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/60 bg-surface/40">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                    City
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-3">
                        <Skeleton className="h-10 w-full bg-surface/60" />
                      </td>
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-16 text-center text-text-secondary"
                    >
                      Quiet here — for now. No signups match.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, i) => (
                    <m.tr
                      key={row.id}
                      variants={riseInSoft}
                      custom={i}
                      className="transition-colors hover:bg-accent/[0.04]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {row.is_founding && (
                            <Crown weight="fill" className="h-3.5 w-3.5 shrink-0 text-gold" />
                          )}
                          <span className="text-sm font-medium text-foreground">
                            {row.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {row.city ? (
                          <span className="flex items-center gap-1 text-xs text-text-secondary">
                            <MapPin weight="light" className="h-3 w-3 text-text-secondary/70" />
                            {row.city}
                          </span>
                        ) : (
                          <span className="text-xs text-text-secondary/60">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] capitalize",
                            statusBadgeColors[row.status] ||
                              statusBadgeColors.pending,
                          )}
                        >
                          {row.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-text-secondary">
                          {formatAmount(row.amount_cents, row.currency)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-text-secondary/80">
                          {row.source || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-text-secondary/80">
                          {formatDistanceToNow(new Date(row.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </td>
                    </m.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
              <span className="text-xs text-text-secondary">
                Showing {(page - 1) * perPage + 1}–
                {Math.min(page * perPage, filteredCount)} of {filteredCount}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-text-secondary hover:text-foreground"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <CaretLeft weight="bold" className="h-4 w-4" />
                </Button>
                <span className="px-2 text-xs text-text-secondary">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-text-secondary hover:text-foreground"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <CaretRight weight="bold" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </m.div>
      </m.div>
    </LazyMotion>
  );
}
