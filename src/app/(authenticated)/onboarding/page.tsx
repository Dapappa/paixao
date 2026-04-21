"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { UserInterest, Boundary } from "@/lib/stores/auth-store";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Heart,
  Plus,
  Shield,
  Sparkles,
  Star,
  Trash2,
  User,
  X,
} from "lucide-react";

const stepLabels = ["Profile", "Interests", "Boundaries", "Welcome"];

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
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
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
    <div className="min-h-dvh flex flex-col items-center justify-start bg-background px-4 py-8 md:py-16">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-serif text-3xl tracking-[0.15em] text-foreground">
          PAIX<span className="text-[var(--color-accent)]">A</span>O
        </h1>
      </motion.div>

      {/* Stepper */}
      <div className="w-full max-w-xl mb-10">
        <OnboardingStepper
          currentStep={currentStep}
          totalSteps={4}
          labels={stepLabels}
        />
      </div>

      {/* Step Content */}
      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ---- Step 1: Profile Basics ---- */}
          {currentStep === 0 && (
            <motion.div
              key="step-0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <User className="h-5 w-5 text-[var(--color-accent)]" />
                      Profile Basics
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Create your identity on Paixao. Your display name is how
                      others will see you.
                    </p>
                  </div>

                  <Separator className="bg-[var(--color-border)]" />

                  {/* Avatar */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface-elevated)] flex items-center justify-center overflow-hidden">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Camera className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload a photo (optional)
                    </p>
                  </div>

                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label htmlFor="display-name">
                      Display Name <span className="text-[var(--color-accent)]">*</span>
                    </Label>
                    <Input
                      id="display-name"
                      placeholder="Choose a unique name..."
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      maxLength={30}
                      className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]"
                    />
                    <p className="text-xs text-muted-foreground">
                      {displayName.length}/30 characters
                      {displayName.length > 0 && displayName.length < 3 && (
                        <span className="text-[var(--color-danger)]">
                          {" "}
                          - minimum 3 characters
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]">
                        <SelectValue placeholder="Select gender..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)]">
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
                      placeholder="e.g., she/her, he/him, they/them..."
                      value={pronouns}
                      onChange={(e) => setPronouns(e.target.value)}
                      className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]"
                    />
                  </div>

                  {/* Sexuality */}
                  <div className="space-y-2">
                    <Label>Sexuality</Label>
                    <Select value={sexuality} onValueChange={setSexuality}>
                      <SelectTrigger className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]">
                        <SelectValue placeholder="Select sexuality..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)]">
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
                    <Label>Relationship Status</Label>
                    <Select
                      value={relationshipStatus}
                      onValueChange={setRelationshipStatus}
                    >
                      <SelectTrigger className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]">
                        <SelectValue placeholder="Select status..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)]">
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
            </motion.div>
          )}

          {/* ---- Step 2: Interests & Desires ---- */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <Heart className="h-5 w-5 text-[var(--color-accent)]" />
                      Interests & Desires
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Select what excites you. Set your experience level for each
                      interest, or mark items as hard limits.
                    </p>
                  </div>

                  <Separator className="bg-[var(--color-border)]" />

                  <InterestSelector
                    selectedInterests={interests}
                    onChange={setInterests}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ---- Step 3: Boundaries ---- */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <Shield className="h-5 w-5 text-[var(--color-accent)]" />
                      Boundaries
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Your boundaries are sacred. Being clear about what you will
                      and won&apos;t do helps build trust and ensures everyone has
                      the best experience.
                    </p>
                  </div>

                  <Separator className="bg-[var(--color-border)]" />

                  {/* Explanation cards */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-3">
                      <p className="text-xs font-semibold text-[var(--color-danger)] mb-1">
                        Hard Limits
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Things you absolutely will not do. Non-negotiable.
                      </p>
                    </div>
                    <div className="rounded-xl border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 p-3">
                      <p className="text-xs font-semibold text-[var(--color-warning)] mb-1">
                        Soft Limits
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Things you&apos;re unsure about. May explore with the right
                        person.
                      </p>
                    </div>
                    <div className="rounded-xl border border-[var(--color-success)]/20 bg-[var(--color-success)]/5 p-3">
                      <p className="text-xs font-semibold text-[var(--color-success)] mb-1">
                        Must-Haves
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Essential things. What you need in any encounter.
                      </p>
                    </div>
                  </div>

                  {/* Add boundary form */}
                  <div className="space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
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
                          <SelectTrigger className="h-9 bg-[var(--color-surface)] border-[var(--color-border)]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)]">
                            <SelectItem value="hard_limit">Hard Limit</SelectItem>
                            <SelectItem value="soft_limit">Soft Limit</SelectItem>
                            <SelectItem value="must_have">Must-Have</SelectItem>
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
                          <SelectTrigger className="h-9 bg-[var(--color-surface)] border-[var(--color-border)]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)]">
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
                      <Label className="text-xs">Description</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Describe your boundary..."
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
                          className="h-9 bg-[var(--color-surface)] border-[var(--color-border)]"
                        />
                        <Button
                          size="sm"
                          onClick={addBoundary}
                          disabled={!newBoundary.description.trim()}
                          className="h-9 bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Boundary list */}
                  {boundaries.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        Your Boundaries ({boundaries.length})
                      </p>
                      <AnimatePresence>
                        {boundaries.map((b) => (
                          <motion.div
                            key={b.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3"
                          >
                            <Badge
                              variant="outline"
                              className={cn(
                                "shrink-0 text-[10px]",
                                b.type === "hard_limit" &&
                                  "border-[var(--color-danger)]/40 text-[var(--color-danger)]",
                                b.type === "soft_limit" &&
                                  "border-[var(--color-warning)]/40 text-[var(--color-warning)]",
                                b.type === "must_have" &&
                                  "border-[var(--color-success)]/40 text-[var(--color-success)]"
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
                              className="shrink-0 text-[10px] bg-[var(--color-surface)] border-[var(--color-border)]"
                            >
                              {b.category}
                            </Badge>
                            <span className="flex-1 text-sm text-foreground truncate">
                              {b.description}
                            </span>
                            <button
                              onClick={() => removeBoundary(b.id)}
                              className="shrink-0 text-muted-foreground hover:text-[var(--color-danger)] transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    You can always update your boundaries later in your profile
                    settings.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ---- Step 4: Welcome ---- */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Card className="border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
                {/* Decorative gradient */}
                <div className="h-2 w-full bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-accent-hover)] to-[var(--color-gold)]" />

                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="text-center space-y-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.2,
                      }}
                      className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)]"
                    >
                      <Sparkles className="h-8 w-8 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-foreground">
                      You&apos;re All Set!
                    </h2>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      Welcome to Paixao, {displayName || "there"}. Your profile
                      is ready. Here&apos;s a summary of what you set up.
                    </p>
                  </div>

                  <Separator className="bg-[var(--color-border)]" />

                  {/* Summary */}
                  <div className="space-y-4">
                    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 space-y-3">
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <User className="h-4 w-4 text-[var(--color-accent)]" />
                        Profile
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>{" "}
                          <span className="text-foreground">{displayName || "Not set"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gender:</span>{" "}
                          <span className="text-foreground">{gender || "Not set"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pronouns:</span>{" "}
                          <span className="text-foreground">{pronouns || "Not set"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sexuality:</span>{" "}
                          <span className="text-foreground">{sexuality || "Not set"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 space-y-3">
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Heart className="h-4 w-4 text-[var(--color-accent)]" />
                        Interests
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {interests.filter((i) => !i.is_hard_limit).length}{" "}
                        interests selected,{" "}
                        {interests.filter((i) => i.is_hard_limit).length} hard
                        limits
                      </p>
                    </div>

                    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 space-y-3">
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4 text-[var(--color-accent)]" />
                        Boundaries
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {boundaries.length} boundaries defined
                      </p>
                    </div>
                  </div>

                  {/* Safety tips */}
                  <div className="rounded-xl border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/5 p-4 space-y-2">
                    <p className="text-sm font-semibold text-[var(--color-gold)] flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Safety Tips
                    </p>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-success)]" />
                        Always communicate boundaries before meeting
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-success)]" />
                        Use the built-in check-in features during events
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-success)]" />
                        Report any behavior that makes you feel unsafe
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-success)]" />
                        Consent can be withdrawn at any time
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex w-full max-w-xl items-center justify-between">
        <Button
          variant="ghost"
          onClick={goPrev}
          disabled={currentStep === 0}
          className="text-muted-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="text-sm text-muted-foreground">
          Step {currentStep + 1} of 4
        </div>

        {currentStep < 3 ? (
          <Button
            onClick={goNext}
            disabled={currentStep === 0 && !isStep1Valid}
            className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={saving}
            className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white hover:opacity-90"
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                Explore Paixao
                <Sparkles className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
