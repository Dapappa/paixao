"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useMatchPreferences } from "@/lib/hooks/use-match-preferences";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FloppyDisk,
  Check,
  SlidersHorizontal,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { toast } from "sonner";
import { MatchesAtmosphere } from "../matches-atmosphere";

/* ─────────────────────────────────────────────
   Options
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

const RELATIONSHIP_TYPE_OPTIONS = [
  { value: "monogamous", label: "Monogamous" },
  { value: "polyamorous", label: "Polyamorous" },
  { value: "open", label: "Open" },
  { value: "casual", label: "Casual" },
  { value: "friends", label: "Friends" },
  { value: "mentor", label: "Mentor/Mentee" },
  { value: "play_partner", label: "Play Partner" },
];

/* ─────────────────────────────────────────────
   PreferencesClient
   ───────────────────────────────────────────── */

export function PreferencesClient() {
  const { preferences, loading, saving, updatePreferences } =
    useMatchPreferences();

  // Local form state
  const [genders, setGenders] = useState<string[]>([]);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(99);
  const [expLevels, setExpLevels] = useState<string[]>([]);
  const [relTypes, setRelTypes] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [useDistance, setUseDistance] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync from fetched preferences
  useEffect(() => {
    if (!preferences) return;
    setGenders(preferences.preferred_genders || []);
    setMinAge(preferences.min_age || 18);
    setMaxAge(preferences.max_age || 99);
    setExpLevels(preferences.preferred_experience_levels || []);
    setRelTypes(preferences.preferred_relationship_types || []);
    setMaxDistance(preferences.max_distance_km);
    setUseDistance(!!preferences.max_distance_km);
  }, [preferences]);

  const toggleOption = (
    current: string[],
    setter: (v: string[]) => void,
    value: string
  ) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  const handleSave = async () => {
    const result = await updatePreferences({
      preferred_genders: genders,
      min_age: minAge,
      max_age: maxAge,
      preferred_experience_levels: expLevels,
      preferred_relationship_types: relTypes,
      max_distance_km: useDistance ? maxDistance : null,
      deal_breakers: preferences?.deal_breakers || [],
    });

    if (result) {
      setSaved(true);
      toast.success("Saved. You're looking good.");
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="relative z-10">
        <MatchesAtmosphere src="/generated/tier1-boudoir-bg.webp" />
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <LoadingSpinner size="lg" />
          <p className="text-sm italic text-text-secondary">Setting the mood&hellip;</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
      <MatchesAtmosphere src="/generated/tier1-boudoir-bg.webp" />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/matches"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/50 backdrop-blur-sm hover:border-accent/30 text-text-secondary hover:text-foreground transition-all"
        >
          <ArrowLeft weight="bold" className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold/80">
            Your terms
          </p>
          <h1 className="mt-1.5 font-serif text-4xl font-bold tracking-tight text-foreground">
            Who you&rsquo;d like to meet
          </h1>
          <p className="text-sm text-text-secondary mt-1.5">
            Set the shape of the room. Change it whenever the mood does.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Gender preferences */}
        <section className="rounded-2xl border border-border/60 bg-surface/50 backdrop-blur-sm p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <SlidersHorizontal weight="light" className="h-4 w-4 text-[var(--color-accent)]" />
            <h2 className="text-sm font-semibold text-foreground">
              Gender Preferences
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Select which genders you want to see. Leave empty to see everyone.
          </p>
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => toggleOption(genders, setGenders, opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  genders.includes(opt.value)
                    ? "bg-[var(--color-accent)]/15 border-[var(--color-accent)]/50 text-[var(--color-accent)]"
                    : "bg-transparent border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Age range */}
        <section className="rounded-2xl border border-border/60 bg-surface/50 backdrop-blur-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Age Range</h2>
          <div className="flex items-center gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Minimum</Label>
              <Input
                type="number"
                min={18}
                max={99}
                value={minAge}
                onChange={(e) =>
                  setMinAge(Math.max(18, Number(e.target.value) || 18))
                }
                className="w-24 bg-surface-elevated border-border"
              />
            </div>
            <span className="text-muted-foreground mt-6">to</span>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Maximum</Label>
              <Input
                type="number"
                min={18}
                max={99}
                value={maxAge}
                onChange={(e) =>
                  setMaxAge(Math.min(99, Number(e.target.value) || 99))
                }
                className="w-24 bg-surface-elevated border-border"
              />
            </div>
          </div>
        </section>

        {/* Experience level */}
        <section className="rounded-2xl border border-border/60 bg-surface/50 backdrop-blur-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Experience Level
          </h2>
          <p className="text-xs text-muted-foreground">
            Filter by experience level. Leave empty to see all levels.
          </p>
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  toggleOption(expLevels, setExpLevels, opt.value)
                }
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  expLevels.includes(opt.value)
                    ? "bg-[var(--color-gold)]/15 border-[var(--color-gold)]/50 text-[var(--color-gold)]"
                    : "bg-transparent border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Relationship type */}
        <section className="rounded-2xl border border-border/60 bg-surface/50 backdrop-blur-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Relationship Types
          </h2>
          <p className="text-xs text-muted-foreground">
            What kind of connections are you looking for?
          </p>
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIP_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => toggleOption(relTypes, setRelTypes, opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  relTypes.includes(opt.value)
                    ? "bg-[var(--color-accent)]/15 border-[var(--color-accent)]/50 text-[var(--color-accent)]"
                    : "bg-transparent border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Distance */}
        <section className="rounded-2xl border border-border/60 bg-surface/50 backdrop-blur-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Maximum Distance
            </h2>
            <Switch checked={useDistance} onCheckedChange={setUseDistance} />
          </div>
          {useDistance && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  max={500}
                  value={maxDistance || 50}
                  onChange={(e) =>
                    setMaxDistance(
                      Math.min(500, Math.max(1, Number(e.target.value) || 50))
                    )
                  }
                  className="w-24 bg-surface-elevated border-border"
                />
                <span className="text-sm text-muted-foreground">km</span>
              </div>
            </motion.div>
          )}
        </section>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]",
              "shadow-[0_0_20px_rgba(194,24,91,0.2)]",
              "min-w-[140px]"
            )}
          >
            {saving ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : saved ? (
              <Check weight="bold" className="mr-2 h-4 w-4" />
            ) : (
              <FloppyDisk weight="light" className="mr-2 h-4 w-4" />
            )}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Preferences"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
