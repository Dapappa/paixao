"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { motion } from "framer-motion";
import { ArrowLeft, UsersThree, Check } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { toast } from "sonner";
import { MatchesAtmosphere } from "../../matches-atmosphere";

/* ─────────────────────────────────────────────
   Group type options
   ───────────────────────────────────────────── */

const GROUP_TYPES = [
  {
    value: "couple",
    label: "Couple",
    desc: "Two partners matching together",
    emoji: "💑",
  },
  {
    value: "triad",
    label: "Triad",
    desc: "Three partners matching together",
    emoji: "💞",
  },
  {
    value: "quad",
    label: "Quad",
    desc: "Four partners matching together",
    emoji: "🔗",
  },
  {
    value: "polycule",
    label: "Polycule",
    desc: "A network of romantic connections",
    emoji: "🌐",
  },
  {
    value: "other",
    label: "Other",
    desc: "Custom group arrangement",
    emoji: "✨",
  },
];

/* ─────────────────────────────────────────────
   CreateGroupClient
   ───────────────────────────────────────────── */

export function CreateGroupClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [groupType, setGroupType] = useState("couple");
  const [description, setDescription] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || name.trim().length < 2) {
      toast.error("Group name must be at least 2 characters");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/matches/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          group_type: groupType,
          description: description.trim() || undefined,
          is_visible: isVisible,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create group");
      }

      const data = await res.json();
      toast.success("Done. Your circle's open.");
      router.push(`/matches/groups/${data.group.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create group"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
      <MatchesAtmosphere />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/matches/groups"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/50 backdrop-blur-sm hover:border-accent/30 text-text-secondary hover:text-foreground transition-all"
        >
          <ArrowLeft weight="bold" className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold/80">
            Arrive together
          </p>
          <h1 className="mt-1.5 font-serif text-4xl font-bold tracking-tight text-foreground">
            Start a group
          </h1>
          <p className="text-sm text-text-secondary mt-1.5">
            Meet the room as one. Set the shape of who you are.
          </p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Group type */}
        <section className="rounded-2xl border border-border/60 bg-surface/50 backdrop-blur-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <UsersThree weight="light" className="h-4 w-4 text-[var(--color-accent)]" />
            Group Type
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {GROUP_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setGroupType(type.value)}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 text-left transition-all",
                  groupType === type.value
                    ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/5"
                    : "border-border hover:border-foreground/20"
                )}
              >
                <span className="text-xl">{type.emoji}</span>
                <div>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      groupType === type.value
                        ? "text-[var(--color-accent)]"
                        : "text-foreground"
                    )}
                  >
                    {type.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{type.desc}</p>
                </div>
                {groupType === type.value && (
                  <Check weight="bold" className="ml-auto h-4 w-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Name */}
        <section className="rounded-2xl border border-border/60 bg-surface/50 backdrop-blur-sm p-5 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="group-name" className="text-sm font-semibold">
              Group Name
            </Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex & Jordan"
              maxLength={100}
              className="bg-surface-elevated border-border"
            />
            <p className="text-xs text-muted-foreground">
              {name.length}/100 characters
            </p>
          </div>
        </section>

        {/* Description */}
        <section className="rounded-2xl border border-border/60 bg-surface/50 backdrop-blur-sm p-5 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="group-desc" className="text-sm font-semibold">
              Description{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="group-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell others about your group..."
              maxLength={500}
              rows={3}
              className="bg-surface-elevated border-border resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>
        </section>

        {/* Visibility */}
        <section className="rounded-2xl border border-border/60 bg-surface/50 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Visible to Others
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Allow other members to find your group
              </p>
            </div>
            <Switch checked={isVisible} onCheckedChange={setIsVisible} />
          </div>
        </section>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-border"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving || !name.trim()}
            className="bg-accent text-white hover:bg-accent-hover shadow-glow-accent min-w-[140px]"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Opening&hellip;
              </>
            ) : (
              <>
                <UsersThree weight="light" className="mr-2 h-4 w-4" />
                Open the circle
              </>
            )}
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
