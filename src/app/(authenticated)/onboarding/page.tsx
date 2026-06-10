"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OnboardingStepper } from "@/components/onboarding/onboarding-stepper";
import { InterestSelector } from "@/components/onboarding/interest-selector";
import { useProfile } from "@/lib/hooks/use-profile";
import type { UserInterest } from "@/lib/stores/auth-store";
import { LazyMotion, domAnimation, m, AnimatePresence } from "motion/react";
import { riseIn, stagger, spring } from "@/lib/motion";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Heart,
  Plus,
  Shield,
  Sparkle,
  Star,
  Trash,
  User,
  Lock,
} from "@phosphor-icons/react/ssr";

const stepLabels = ["You", "Desires", "Boundaries", "Welcome"];

const genderOptions = [
  "Man",
  "Woman",
  "Non-binary",
  "Trans man",
  "Trans woman",
  "Genderqueer",
  "Genderfluid",
  "Agender",
  "Two-Spirit",
  "Prefer not to say",
  "Other",
];

const sexualityOptions = [
  "Straight",
  "Gay",
  "Lesbian",
  "Bisexual",
  "Pansexual",
  "Queer",
  "Asexual",
  "Demisexual",
  "Fluid",
  "Questioning",
  "Prefer not to say",
  "Other",
];

const relationshipOptions = [
  "Single",
  "In a relationship",
  "Married",
  "Open relationship",
  "Polyamorous",
  "It's complicated",
  "Prefer not to say",
];

const boundaryCategories = [
  "Physical",
  "Emotional",
  "Communication",
  "Sexual",
  "Social",
  "Other",
];

interface BoundaryEntry {
  id: string;
  type: "hard_limit" | "soft_limit" | "must_have";
  category: string;
  description: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const { updateProfile } = useProfile();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Profile basics
  const [displayName, setDisplayName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [gender, setGender] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [sexuality, setSexuality] = useState("");
  const [relationshipStatus, setRelationshipStatus] = useState("");

  // Step 2: Interests
  const [interests, setInterests] = useState<UserInterest[]>([]);

  // Step 3: Boundaries
  const [boundaries, setBoundaries] = useState<BoundaryEntry[]>([]);
  const [newBoundary, setNewBoundary] = useState({
    type: "hard_limit" as BoundaryEntry["type"],
    category: "Physical",
    description: "",
  });

  const goNext = () => {
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const addBoundary = () => {
    if (!newBoundary.description.trim()) return;
    setBoundaries((prev) => [
      ...prev,
      { ...newBoundary, id: crypto.randomUUID() },
    ]);
    setNewBoundary({ ...newBoundary, description: "" });
  };

  const removeBoundary = (id: string) => {
    setBoundaries((prev) => prev.filter((b) => b.id !== id));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await updateProfile({
        display_name: displayName || null,
        gender: gender || null,
        pronouns: pronouns || null,
        sexuality: sexuality || null,
        relationship_status: relationshipStatus || null,
        interests,
        boundaries: boundaries.map((b) => ({
          id: b.id,
          type: b.type,
          category: b.category,
          description: b.description,
        })),
        onboarding_completed: true,
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save onboarding:", error);
    } finally {
      setSaving(false);
    }
  };

  const isStep1Valid = displayName.length >= 3 && displayName.length <= 30;

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative min-h-dvh overflow-hidden bg-background">
        {/* ── A real room, opened to you — warm, lived-in, low-lit ── */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <Image
            src="/generated/real-ambiance.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_35%] opacity-[0.20]"
          />
          {/* near-black mask so copy stays legible */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
          <div className="aura-field absolute inset-0 animate-aura-drift opacity-60" />
          {/* breathing focal warmth */}
          <div className="absolute left-1/2 top-[6%] h-[520px] w-[680px] -translate-x-1/2 animate-breath rounded-full bg-accent/[0.06] blur-[140px]" />
          <div className="absolute bottom-[-8%] right-[-6%] h-[420px] w-[560px] rounded-full bg-gold/[0.05] blur-[120px]" />
        </div>

        <div className="relative z-10 flex min-h-dvh flex-col items-center justify-start px-4 py-10 md:py-16">
          {/* ── Welcome header ── */}
          <m.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mb-9 text-center"
          >
            <m.span
              variants={riseIn}
              custom={0}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-4 py-1.5 text-xs font-medium text-text-secondary backdrop-blur-sm"
            >
              <Lock weight="light" className="h-3.5 w-3.5 text-gold" />
              You&rsquo;re anonymous until you decide otherwise
            </m.span>
            <m.h1
              variants={riseIn}
              custom={1}
              className="mt-6 animate-breath font-serif text-4xl font-bold tracking-[0.06em] text-foreground sm:text-5xl"
            >
              PAIX<span className="text-accent">Ã</span>O
            </m.h1>
            <m.p
              variants={riseIn}
              custom={2}
              className="mx-auto mt-4 max-w-md font-serif text-lg italic text-gold"
            >
              Come in. Make yourself known, slowly.
            </m.p>
          </m.div>

          {/* ── Stepper ── */}
          <div className="mb-10 w-full max-w-xl">
            <OnboardingStepper
              currentStep={currentStep}
              totalSteps={4}
              labels={stepLabels}
            />
          </div>

          {/* ── Step content ── */}
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait" custom={direction}>
              {/* ---- Step 1: Profile Basics ---- */}
              {currentStep === 0 && (
                <m.div
                  key="step-0"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={spring.silk}
                >
                  <Card className="rounded-2xl border-border/60 bg-surface/70 backdrop-blur-sm">
                    <CardContent className="space-y-6 p-6 md:p-8">
                      <div className="space-y-1.5">
                        <h2 className="flex items-center gap-2.5 font-serif text-2xl font-semibold text-foreground">
                          <User weight="light" className="h-5 w-5 text-accent" />
                          Who you&rsquo;ll be here
                        </h2>
                        <p className="text-sm leading-relaxed text-text-secondary">
                          Pick a name to be known by. That&rsquo;s all anyone sees
                          to start — the rest stays yours to offer, when you&rsquo;re
                          ready.
                        </p>
                      </div>

                      <Separator className="bg-border" />

                      {/* Avatar */}
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-surface-elevated">
                            {avatarPreview ? (
                              <img
                                src={avatarPreview}
                                alt="Avatar preview"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Camera weight="duotone" className="h-8 w-8 text-text-secondary" />
                            )}
                          </div>
                          <label
                            htmlFor="avatar-upload"
                            className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover"
                          >
                            <Plus weight="bold" className="h-4 w-4" />
                          </label>
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                        </div>
                        <p className="text-xs text-text-secondary">
                          A face, only if you want one shown
                        </p>
                      </div>

                      {/* Display Name */}
                      <div className="space-y-2">
                        <Label htmlFor="display-name">
                          Display name <span className="text-accent">*</span>
                        </Label>
                        <Input
                          id="display-name"
                          placeholder="What should we call you?"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          maxLength={30}
                          className="border-border bg-surface-elevated"
                        />
                        <p className="text-xs text-text-secondary">
                          {displayName.length}/30 characters
                          {displayName.length > 0 && displayName.length < 3 && (
                            <span className="text-danger">
                              {" "}
                              — give us at least 3
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Gender */}
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger className="border-border bg-surface-elevated">
                            <SelectValue placeholder="However you identify…" />
                          </SelectTrigger>
                          <SelectContent className="border-border bg-surface">
                            {genderOptions.map((g) => (
                              <SelectItem key={g} value={g}>
                                {g}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Pronouns */}
                      <div className="space-y-2">
                        <Label htmlFor="pronouns">Pronouns</Label>
                        <Input
                          id="pronouns"
                          placeholder="she/her, he/him, they/them…"
                          value={pronouns}
                          onChange={(e) => setPronouns(e.target.value)}
                          className="border-border bg-surface-elevated"
                        />
                      </div>

                      {/* Sexuality */}
                      <div className="space-y-2">
                        <Label>Sexuality</Label>
                        <Select value={sexuality} onValueChange={setSexuality}>
                          <SelectTrigger className="border-border bg-surface-elevated">
                            <SelectValue placeholder="Who you&rsquo;re drawn to…" />
                          </SelectTrigger>
                          <SelectContent className="border-border bg-surface">
                            {sexualityOptions.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Relationship Status */}
                      <div className="space-y-2">
                        <Label>Relationship status</Label>
                        <Select
                          value={relationshipStatus}
                          onValueChange={setRelationshipStatus}
                        >
                          <SelectTrigger className="border-border bg-surface-elevated">
                            <SelectValue placeholder="Where things stand…" />
                          </SelectTrigger>
                          <SelectContent className="border-border bg-surface">
                            {relationshipOptions.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </m.div>
              )}

              {/* ---- Step 2: Interests & Desires ---- */}
              {currentStep === 1 && (
                <m.div
                  key="step-1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={spring.silk}
                >
                  <Card className="rounded-2xl border-border/60 bg-surface/70 backdrop-blur-sm">
                    <CardContent className="space-y-6 p-6 md:p-8">
                      <div className="space-y-1.5">
                        <h2 className="flex items-center gap-2.5 font-serif text-2xl font-semibold text-foreground">
                          <Heart weight="light" className="h-5 w-5 text-accent" />
                          What you&rsquo;re after
                        </h2>
                        <p className="text-sm leading-relaxed text-text-secondary">
                          The things you&rsquo;d never put on a first date. Name what
                          warms you, set how far you&rsquo;ve gone — or mark a line
                          you won&rsquo;t cross. This is how we find your people.
                        </p>
                      </div>

                      <Separator className="bg-border" />

                      <InterestSelector
                        selectedInterests={interests}
                        onChange={setInterests}
                      />
                    </CardContent>
                  </Card>
                </m.div>
              )}

              {/* ---- Step 3: Boundaries ---- */}
              {currentStep === 2 && (
                <m.div
                  key="step-2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={spring.silk}
                >
                  <Card className="rounded-2xl border-border/60 bg-surface/70 backdrop-blur-sm">
                    <CardContent className="space-y-6 p-6 md:p-8">
                      <div className="space-y-1.5">
                        <h2 className="flex items-center gap-2.5 font-serif text-2xl font-semibold text-foreground">
                          <Shield weight="light" className="h-5 w-5 text-accent" />
                          Your lines
                        </h2>
                        <p className="text-sm leading-relaxed text-text-secondary">
                          Your boundaries set the tempo here — named out loud,
                          honored without question. Being clear about what you will
                          and won&apos;t do is how trust starts.
                        </p>
                      </div>

                      <Separator className="bg-border" />

                      {/* Explanation cards */}
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-danger/20 bg-danger/5 p-3">
                          <p className="mb-1 text-xs font-semibold text-danger">
                            Hard limits
                          </p>
                          <p className="text-[11px] leading-relaxed text-text-secondary">
                            What you won&rsquo;t do. Never up for discussion.
                          </p>
                        </div>
                        <div className="rounded-xl border border-warning/20 bg-warning/5 p-3">
                          <p className="mb-1 text-xs font-semibold text-warning">
                            Soft limits
                          </p>
                          <p className="text-[11px] leading-relaxed text-text-secondary">
                            Maybes. Doors you might open with the right person.
                          </p>
                        </div>
                        <div className="rounded-xl border border-success/20 bg-success/5 p-3">
                          <p className="mb-1 text-xs font-semibold text-success">
                            Must-haves
                          </p>
                          <p className="text-[11px] leading-relaxed text-text-secondary">
                            What you need present before anything begins.
                          </p>
                        </div>
                      </div>

                      {/* Add boundary form */}
                      <div className="space-y-3 rounded-xl border border-border bg-surface-elevated p-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Type</Label>
                            <Select
                              value={newBoundary.type}
                              onValueChange={(val) =>
                                setNewBoundary({
                                  ...newBoundary,
                                  type: val as BoundaryEntry["type"],
                                })
                              }
                            >
                              <SelectTrigger className="h-9 border-border bg-surface">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="border-border bg-surface">
                                <SelectItem value="hard_limit">
                                  Hard limit
                                </SelectItem>
                                <SelectItem value="soft_limit">
                                  Soft limit
                                </SelectItem>
                                <SelectItem value="must_have">Must-have</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Category</Label>
                            <Select
                              value={newBoundary.category}
                              onValueChange={(val) =>
                                setNewBoundary({ ...newBoundary, category: val })
                              }
                            >
                              <SelectTrigger className="h-9 border-border bg-surface">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="border-border bg-surface">
                                {boundaryCategories.map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {c}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">In your words</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Name the line…"
                              value={newBoundary.description}
                              onChange={(e) =>
                                setNewBoundary({
                                  ...newBoundary,
                                  description: e.target.value,
                                })
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addBoundary();
                                }
                              }}
                              className="h-9 border-border bg-surface"
                            />
                            <Button
                              size="sm"
                              onClick={addBoundary}
                              disabled={!newBoundary.description.trim()}
                              className="h-9 bg-accent text-white hover:bg-accent-hover"
                            >
                              <Plus weight="bold" className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Boundary list */}
                      {boundaries.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">
                            Your lines ({boundaries.length})
                          </p>
                          <AnimatePresence>
                            {boundaries.map((b) => (
                              <m.div
                                key={b.id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-3 rounded-lg border border-border bg-surface-elevated px-4 py-3"
                              >
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "shrink-0 text-[10px]",
                                    b.type === "hard_limit" &&
                                      "border-danger/40 text-danger",
                                    b.type === "soft_limit" &&
                                      "border-warning/40 text-warning",
                                    b.type === "must_have" &&
                                      "border-success/40 text-success"
                                  )}
                                >
                                  {b.type === "hard_limit"
                                    ? "Hard"
                                    : b.type === "soft_limit"
                                    ? "Soft"
                                    : "Must"}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="shrink-0 border-border bg-surface text-[10px]"
                                >
                                  {b.category}
                                </Badge>
                                <span className="flex-1 truncate text-sm text-foreground">
                                  {b.description}
                                </span>
                                <button
                                  onClick={() => removeBoundary(b.id)}
                                  className="shrink-0 text-text-secondary transition-colors hover:text-danger"
                                >
                                  <Trash weight="light" className="h-4 w-4" />
                                </button>
                              </m.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}

                      <p className="text-xs text-text-secondary">
                        These move with you. Adjust them any time from your profile.
                      </p>
                    </CardContent>
                  </Card>
                </m.div>
              )}

              {/* ---- Step 4: Welcome ---- */}
              {currentStep === 3 && (
                <m.div
                  key="step-3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={spring.silk}
                >
                  <Card className="overflow-hidden rounded-2xl border-border/60 bg-surface/70 backdrop-blur-sm">
                    {/* The room you're stepping into — a real, warm space */}
                    <div className="relative h-36 w-full sm:h-44">
                      <Image
                        src="/generated/real-couple.webp"
                        alt="A couple at ease together by warm light"
                        fill
                        sizes="(max-width: 640px) 100vw, 576px"
                        className="object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-accent via-accent-hover to-gold" />
                    </div>

                    <CardContent className="space-y-6 p-6 md:p-8">
                      <div className="space-y-3 text-center">
                        <m.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ ...spring.allure, delay: 0.15 }}
                          className="mx-auto flex h-16 w-16 animate-breath items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-hover shadow-glow-accent"
                        >
                          <Sparkle weight="duotone" className="h-8 w-8 text-white" />
                        </m.div>
                        <h2 className="font-serif text-3xl font-bold text-foreground">
                          The room&rsquo;s yours now
                        </h2>
                        <p className="mx-auto max-w-sm leading-relaxed text-text-secondary">
                          Welcome in, {displayName || "stranger"}. You&rsquo;re set —
                          here&rsquo;s what you brought with you.
                        </p>
                      </div>

                      <Separator className="bg-border" />

                      {/* Summary */}
                      <div className="space-y-4">
                        <div className="space-y-3 rounded-xl border border-border bg-surface-elevated p-4">
                          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <User weight="light" className="h-4 w-4 text-accent" />
                            You
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-text-secondary">Name:</span>{" "}
                              <span className="text-foreground">
                                {displayName || "Not set"}
                              </span>
                            </div>
                            <div>
                              <span className="text-text-secondary">Gender:</span>{" "}
                              <span className="text-foreground">
                                {gender || "Not set"}
                              </span>
                            </div>
                            <div>
                              <span className="text-text-secondary">Pronouns:</span>{" "}
                              <span className="text-foreground">
                                {pronouns || "Not set"}
                              </span>
                            </div>
                            <div>
                              <span className="text-text-secondary">Sexuality:</span>{" "}
                              <span className="text-foreground">
                                {sexuality || "Not set"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 rounded-xl border border-border bg-surface-elevated p-4">
                          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Heart weight="light" className="h-4 w-4 text-accent" />
                            Desires
                          </p>
                          <p className="text-sm text-text-secondary">
                            {interests.filter((i) => !i.is_hard_limit).length} named,{" "}
                            {interests.filter((i) => i.is_hard_limit).length} held
                            back as hard limits
                          </p>
                        </div>

                        <div className="space-y-3 rounded-xl border border-border bg-surface-elevated p-4">
                          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Shield weight="light" className="h-4 w-4 text-accent" />
                            Boundaries
                          </p>
                          <p className="text-sm text-text-secondary">
                            {boundaries.length} lines drawn
                          </p>
                        </div>
                      </div>

                      {/* Safety tips */}
                      <div className="space-y-2 rounded-xl border border-gold/20 bg-gold-muted p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-gold">
                          <Star weight="fill" className="h-4 w-4" />
                          Before you wander in
                        </p>
                        <ul className="space-y-1.5 text-xs text-text-secondary">
                          <li className="flex items-start gap-2">
                            <Check weight="bold" className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                            Say your boundaries out loud before you meet
                          </li>
                          <li className="flex items-start gap-2">
                            <Check weight="bold" className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                            Lean on the check-in tools during events
                          </li>
                          <li className="flex items-start gap-2">
                            <Check weight="bold" className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                            Report anything that makes you feel uneasy
                          </li>
                          <li className="flex items-start gap-2">
                            <Check weight="bold" className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                            Yes can be taken back, any time, no reason needed
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </m.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Navigation ── */}
          <div className="mt-6 flex w-full max-w-xl items-center justify-between">
            <Button
              variant="ghost"
              onClick={goPrev}
              disabled={currentStep === 0}
              className="text-text-secondary"
            >
              <ArrowLeft weight="bold" className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="text-sm text-text-secondary">
              Step {currentStep + 1} of 4
            </div>

            {currentStep < 3 ? (
              <Button
                onClick={goNext}
                disabled={currentStep === 0 && !isStep1Valid}
                className="bg-accent text-white hover:bg-accent-hover"
              >
                Go on
                <ArrowRight weight="bold" className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={saving}
                className="bg-gradient-to-r from-accent to-accent-hover text-white hover:opacity-90"
              >
                {saving ? (
                  <>Setting the mood…</>
                ) : (
                  <>
                    Step inside
                    <Sparkle weight="fill" className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* ── Atmosphere overlays (fixed, non-interactive) ── */}
        <div className="vignette" aria-hidden />
        <div className="film-grain" aria-hidden />
      </div>
    </LazyMotion>
  );
}
