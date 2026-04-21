"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { EventFilters } from "@/lib/hooks/use-events";

const eventTypeOptions = [
  { value: "munch", label: "Munch" },
  { value: "play_party", label: "Play Party" },
  { value: "workshop", label: "Workshop" },
  { value: "social", label: "Social" },
  { value: "dungeon", label: "Dungeon" },
  { value: "retreat", label: "Retreat" },
  { value: "conference", label: "Conference" },
  { value: "other", label: "Other" },
];

const formatOptions = [
  { value: "in_person", label: "In Person" },
  { value: "virtual", label: "Virtual" },
  { value: "hybrid", label: "Hybrid" },
];

interface EventFilterBarProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  className?: string;
}

export function EventFilterBar({
  filters,
  onFiltersChange,
  className,
}: EventFilterBarProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const updateFilter = useCallback(
    (key: keyof EventFilters, value: string | undefined) => {
      onFiltersChange({ ...filters, [key]: value || undefined });
    },
    [filters, onFiltersChange]
  );

  const clearFilters = useCallback(() => {
    onFiltersChange({});
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.event_type ||
    filters.format ||
    filters.city ||
    filters.search ||
    filters.date_from ||
    filters.date_to;

  const activeFilterCount = [
    filters.event_type,
    filters.format,
    filters.city,
    filters.date_from,
  ].filter(Boolean).length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main bar */}
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10 bg-surface border-border"
          />
        </div>

        {/* Mobile filter toggle */}
        <Button
          variant="outline"
          size="icon"
          className="md:hidden relative border-border"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* Desktop filters */}
        <div className="hidden md:flex items-center gap-2">
          <Select
            value={filters.event_type || ""}
            onValueChange={(v) =>
              updateFilter("event_type", v === "all" ? undefined : v)
            }
          >
            <SelectTrigger className="w-[140px] bg-surface border-border">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {eventTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.format || ""}
            onValueChange={(v) =>
              updateFilter("format", v === "all" ? undefined : v)
            }
          >
            <SelectTrigger className="w-[130px] bg-surface border-border">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              {formatOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="City"
            value={filters.city || ""}
            onChange={(e) => updateFilter("city", e.target.value)}
            className="w-[130px] bg-surface border-border"
          />

          <Input
            type="date"
            value={filters.date_from || ""}
            onChange={(e) => updateFilter("date_from", e.target.value)}
            className="w-[150px] bg-surface border-border"
          />

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Mobile filters panel */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-surface p-3">
              <Select
                value={filters.event_type || ""}
                onValueChange={(v) =>
                  updateFilter("event_type", v === "all" ? undefined : v)
                }
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {eventTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.format || ""}
                onValueChange={(v) =>
                  updateFilter("format", v === "all" ? undefined : v)
                }
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  {formatOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="text"
                placeholder="City"
                value={filters.city || ""}
                onChange={(e) => updateFilter("city", e.target.value)}
                className="bg-background border-border"
              />

              <Input
                type="date"
                value={filters.date_from || ""}
                onChange={(e) => updateFilter("date_from", e.target.value)}
                className="bg-background border-border"
              />

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="col-span-2 text-muted-foreground"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear all filters
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.event_type && (
            <Badge
              variant="secondary"
              className="gap-1 bg-[var(--color-accent-muted)] text-[var(--color-accent)] border-0 cursor-pointer"
              onClick={() => updateFilter("event_type", undefined)}
            >
              {eventTypeOptions.find((o) => o.value === filters.event_type)
                ?.label || filters.event_type}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {filters.format && (
            <Badge
              variant="secondary"
              className="gap-1 bg-[var(--color-gold-muted)] text-[var(--color-gold)] border-0 cursor-pointer"
              onClick={() => updateFilter("format", undefined)}
            >
              {formatOptions.find((o) => o.value === filters.format)?.label ||
                filters.format}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {filters.city && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer"
              onClick={() => updateFilter("city", undefined)}
            >
              {filters.city}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {filters.date_from && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer"
              onClick={() => updateFilter("date_from", undefined)}
            >
              From {filters.date_from}
              <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
