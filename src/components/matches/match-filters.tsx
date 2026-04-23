"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

/* ─────────────────────────────────────────────
   Filter options
   ───────────────────────────────────────────── */

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-Binary" },
  { value: "trans_male", label: "Trans Male" },
  { value: "trans_female", label: "Trans Female" },
  { value: "genderfluid", label: "Genderfluid" },
  { value: "agender", label: "Agender" },
  { value: "other", label: "Other" },
];

const EXPERIENCE_OPTIONS = [
  { value: "curious", label: "Curious" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "experienced", label: "Experienced" },
  { value: "expert", label: "Expert" },
];

/* ─────────────────────────────────────────────
   MatchFilters
   ───────────────────────────────────────────── */

export interface MatchFiltersState {
  genders: string[];
  min_age: number;
  max_age: number;
  experience_levels: string[];
}

interface MatchFiltersProps {
  filters: MatchFiltersState;
  onFiltersChange: (filters: MatchFiltersState) => void;
  className?: string;
}

export function MatchFilters({
  filters,
  onFiltersChange,
  className,
}: MatchFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const activeFilterCount =
    filters.genders.length +
    filters.experience_levels.length +
    (filters.min_age > 18 ? 1 : 0) +
    (filters.max_age < 99 ? 1 : 0);

  const toggleGender = (value: string) => {
    const next = filters.genders.includes(value)
      ? filters.genders.filter((g) => g !== value)
      : [...filters.genders, value];
    onFiltersChange({ ...filters, genders: next });
  };

  const toggleExperience = (value: string) => {
    const next = filters.experience_levels.includes(value)
      ? filters.experience_levels.filter((e) => e !== value)
      : [...filters.experience_levels, value];
    onFiltersChange({ ...filters, experience_levels: next });
  };

  const clearFilters = () => {
    onFiltersChange({
      genders: [],
      min_age: 18,
      max_age: 99,
      experience_levels: [],
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Toggle row */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "border-border text-muted-foreground hover:text-foreground",
            expanded && "border-[var(--color-accent)]/40 text-[var(--color-accent)]"
          )}
        >
          <SlidersHorizontal className="mr-1.5 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-[var(--color-accent)] text-white text-[10px] border-0">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      {/* Expanded filter panel */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden rounded-xl border border-border bg-surface p-4 space-y-4"
        >
          {/* Gender */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              Gender
            </label>
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleGender(opt.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                    filters.genders.includes(opt.value)
                      ? "bg-[var(--color-accent)]/15 border-[var(--color-accent)]/50 text-[var(--color-accent)]"
                      : "bg-transparent border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Age range */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              Age Range
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={18}
                max={99}
                value={filters.min_age}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    min_age: Math.max(18, Number(e.target.value) || 18),
                  })
                }
                className="w-20 h-9 text-center bg-surface-elevated border-border"
              />
              <span className="text-muted-foreground text-sm">to</span>
              <Input
                type="number"
                min={18}
                max={99}
                value={filters.max_age}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    max_age: Math.min(99, Number(e.target.value) || 99),
                  })
                }
                className="w-20 h-9 text-center bg-surface-elevated border-border"
              />
            </div>
          </div>

          {/* Experience level */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              Experience Level
            </label>
            <div className="flex flex-wrap gap-2">
              {EXPERIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleExperience(opt.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                    filters.experience_levels.includes(opt.value)
                      ? "bg-[var(--color-gold)]/15 border-[var(--color-gold)]/50 text-[var(--color-gold)]"
                      : "bg-transparent border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
