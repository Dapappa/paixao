"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { interestCategories, type InterestCategory } from "@/config/interests";
import type { UserInterest } from "@/lib/stores/auth-store";
import { motion, AnimatePresence } from "framer-motion";
import { Ban, Sparkles } from "lucide-react";

interface InterestSelectorProps {
  selectedInterests: UserInterest[];
  onChange: (interests: UserInterest[]) => void;
}

const levelColors: Record<string, string> = {
  curious: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  interested: "bg-green-500/15 text-green-400 border-green-500/30",
  experienced: "bg-[var(--color-gold)]/15 text-[var(--color-gold)] border-[var(--color-gold)]/30",
  expert: "bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/30",
};

const levelLabels = ["curious", "interested", "experienced", "expert"] as const;

export function InterestSelector({
  selectedInterests,
  onChange,
}: InterestSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>(
    interestCategories[0].id
  );

  const isSelected = (interestId: string) =>
    selectedInterests.some((i) => i.interest_id === interestId && !i.is_hard_limit);

  const isHardLimit = (interestId: string) =>
    selectedInterests.some((i) => i.interest_id === interestId && i.is_hard_limit);

  const getLevel = (interestId: string) =>
    selectedInterests.find((i) => i.interest_id === interestId)?.level || "curious";

  const toggleInterest = (interestId: string) => {
    const existing = selectedInterests.find(
      (i) => i.interest_id === interestId
    );

    if (existing) {
      // Remove it
      onChange(selectedInterests.filter((i) => i.interest_id !== interestId));
    } else {
      // Add as curious
      onChange([
        ...selectedInterests,
        { interest_id: interestId, level: "curious", is_hard_limit: false },
      ]);
    }
  };

  const toggleHardLimit = (interestId: string) => {
    const existing = selectedInterests.find(
      (i) => i.interest_id === interestId
    );

    if (existing?.is_hard_limit) {
      // Remove hard limit
      onChange(selectedInterests.filter((i) => i.interest_id !== interestId));
    } else {
      // Set as hard limit (remove interest if exists, add as hard limit)
      const filtered = selectedInterests.filter(
        (i) => i.interest_id !== interestId
      );
      onChange([
        ...filtered,
        { interest_id: interestId, level: "curious", is_hard_limit: true },
      ]);
    }
  };

  const setLevel = (interestId: string, level: UserInterest["level"]) => {
    onChange(
      selectedInterests.map((i) =>
        i.interest_id === interestId ? { ...i, level } : i
      )
    );
  };

  const currentCategory = interestCategories.find(
    (c) => c.id === activeCategory
  )!;

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {interestCategories.map((category) => {
          const isActive = activeCategory === category.id;
          const count = selectedInterests.filter(
            (i) =>
              category.items.some((item) => item.id === i.interest_id) &&
              !i.is_hard_limit
          ).length;

          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "relative rounded-lg px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)]/30"
                  : "bg-[var(--color-surface)] text-muted-foreground border border-[var(--color-border)] hover:border-[var(--color-border)]/60 hover:text-foreground"
              )}
            >
              {category.label}
              {count > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Category Description */}
      <p className="text-sm text-muted-foreground">{currentCategory.description}</p>

      {/* Interest Tags */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex flex-wrap gap-2"
        >
          {currentCategory.items.map((interest) => {
            const selected = isSelected(interest.id);
            const hardLimit = isHardLimit(interest.id);
            const level = getLevel(interest.id);

            return (
              <div key={interest.id} className="group relative">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleInterest(interest.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                    hardLimit
                      ? "border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 text-[var(--color-danger)] line-through opacity-70"
                      : selected
                      ? levelColors[level]
                      : "border-[var(--color-border)] bg-[var(--color-surface)] text-muted-foreground hover:border-[var(--color-accent)]/40 hover:text-foreground"
                  )}
                >
                  {interest.emoji && (
                    <span className="text-xs">{interest.emoji}</span>
                  )}
                  {interest.label}
                </motion.button>

                {/* Level selector (shown when selected) */}
                {selected && !hardLimit && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-1"
                  >
                    <Select
                      value={level}
                      onValueChange={(val) =>
                        setLevel(interest.id, val as UserInterest["level"])
                      }
                    >
                      <SelectTrigger className="h-7 w-32 text-xs border-[var(--color-border)] bg-[var(--color-surface)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)]">
                        {levelLabels.map((l) => (
                          <SelectItem key={l} value={l} className="text-xs capitalize">
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}

                {/* Hard limit toggle */}
                <button
                  onClick={() => toggleHardLimit(interest.id)}
                  className={cn(
                    "absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full text-[10px] group-hover:flex transition-colors",
                    hardLimit
                      ? "bg-[var(--color-danger)] text-white"
                      : "bg-[var(--color-surface-elevated)] text-muted-foreground border border-[var(--color-border)] hover:bg-[var(--color-danger)] hover:text-white hover:border-[var(--color-danger)]"
                  )}
                  title={hardLimit ? "Remove hard limit" : "Mark as hard limit"}
                >
                  <Ban className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Summary */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent)]" />
          <span>
            {selectedInterests.filter((i) => !i.is_hard_limit).length} interests
            selected
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Ban className="h-3.5 w-3.5 text-[var(--color-danger)]" />
          <span>
            {selectedInterests.filter((i) => i.is_hard_limit).length} hard limits
          </span>
        </div>
      </div>
    </div>
  );
}
