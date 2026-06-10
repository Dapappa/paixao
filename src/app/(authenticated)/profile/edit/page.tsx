"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InterestSelector } from "@/components/onboarding/interest-selector";
import { useProfile } from "@/lib/hooks/use-profile";
import type { UserInterest, Boundary } from "@/lib/stores/auth-store";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Heart,
  MapPin,
  Plus,
  FloppyDisk,
  Shield,
  Trash,
  User,
} from "@phosphor-icons/react/ssr";

const genderOptions = [
  "Man", "Woman", "Non-binary", "Trans man", "Trans woman",
  "Genderqueer", "Genderfluid", "Agender", "Two-Spirit",
  "Prefer not to say", "Other",
];

const sexualityOptions = [
  "Straight", "Gay", "Lesbian", "Bisexual", "Pansexual",
  "Queer", "Asexual", "Demisexual", "Fluid", "Questioning",
  "Prefer not to say", "Other",
];

const relationshipOptions = [
  "Single", "In a relationship", "Married", "Open relationship",
  "Polyamorous", "It's complicated", "Prefer not to say",
];

const experienceLevels = [
  "Newcomer", "Beginner", "Intermediate", "Experienced", "Expert",
];

const lookingForOptions = [
  "Casual", "Dating", "Friends", "Play partners", "Mentoring",
  "Networking", "Long-term", "Events only",
];

const visibilityOptions = [
  { value: "visible", label: "Visible", desc: "Everyone can see your profile" },
  { value: "hidden", label: "Hidden", desc: "Your profile is invisible" },
  { value: "matches_only", label: "Matches Only", desc: "Only mutual matches see you" },
];

const boundaryCategories = [
  "Physical", "Emotional", "Communication", "Sexual", "Social", "Other",
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, loading, updateProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [sexuality, setSexuality] = useState("");
  const [relationshipStatus, setRelationshipStatus] = useState("");
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const [visibility, setVisibility] = useState("visible");

  // New boundary form
  const [newBoundary, setNewBoundary] = useState({
    type: "hard_limit" as Boundary["type"],
    category: "Physical",
    description: "",
  });

  // Initialize form from profile
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setTagline(profile.tagline || "");
      setBio(profile.bio || "");
      setGender(profile.gender || "");
      setPronouns(profile.pronouns || "");
      setSexuality(profile.sexuality || "");
      setRelationshipStatus(profile.relationship_status || "");
      setLookingFor(profile.looking_for || []);
      setLocation(profile.location || "");
      setExperienceLevel(profile.experience_level || "");
      setInterests(profile.interests || []);
      setBoundaries(profile.boundaries || []);
      setVisibility(profile.profile_visibility || "visible");
    }
  }, [profile]);

  const toggleLookingFor = (option: string) => {
    setLookingFor((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
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

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({
        display_name: displayName || null,
        tagline: tagline || null,
        bio: bio || null,
        gender: gender || null,
        pronouns: pronouns || null,
        sexuality: sexuality || null,
        relationship_status: relationshipStatus || null,
        looking_for: lookingFor,
        location: location || null,
        experience_level: experienceLevel || null,
        interests,
        boundaries,
        profile_visibility: visibility as "visible" | "hidden" | "matches_only",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-3xl space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9"
          >
            <ArrowLeft weight="bold" className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Edit Profile</h1>
            <p className="text-sm text-muted-foreground">
              Update your identity and preferences
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
        >
          {saving ? (
            <LoadingSpinner size="sm" />
          ) : saved ? (
            <>
              <Check weight="bold" className="mr-2 h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <FloppyDisk weight="light" className="mr-2 h-4 w-4" />
              Save
            </>
          )}
        </Button>
      </motion.div>

      {/* Basic Info */}
      <motion.div variants={item}>
        <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User weight="light" className="h-4 w-4 text-[var(--color-accent)]" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Display Name</Label>
                <Input
                  id="edit-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={30}
                  className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-pronouns">Pronouns</Label>
                <Input
                  id="edit-pronouns"
                  value={pronouns}
                  onChange={(e) => setPronouns(e.target.value)}
                  placeholder="e.g., they/them"
                  className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tagline">Tagline</Label>
              <Input
                id="edit-tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="A short phrase about you..."
                maxLength={80}
                className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                rows={4}
                className="bg-[var(--color-surface-elevated)] border-[var(--color-border)] resize-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)]">
                    {genderOptions.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sexuality</Label>
                <Select value={sexuality} onValueChange={setSexuality}>
                  <SelectTrigger className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)]">
                    {sexualityOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Relationship Status</Label>
                <Select value={relationshipStatus} onValueChange={setRelationshipStatus}>
                  <SelectTrigger className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)]">
                    {relationshipOptions.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)]">
                    {experienceLevels.map((e) => (
                      <SelectItem key={e} value={e.toLowerCase()}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">
                <MapPin weight="light" className="inline h-3.5 w-3.5 mr-1" />
                Location
              </Label>
              <Input
                id="edit-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State or Region"
                className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]"
              />
            </div>

            {/* Looking For */}
            <div className="space-y-2">
              <Label>Looking For</Label>
              <div className="flex flex-wrap gap-2">
                {lookingForOptions.map((option) => {
                  const selected = lookingFor.includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => toggleLookingFor(option)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                        selected
                          ? "border-[var(--color-accent)]/30 bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                          : "border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <Label>Profile Visibility</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {visibilityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setVisibility(opt.value)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-all",
                      visibility === opt.value
                        ? "border-[var(--color-accent)]/40 bg-[var(--color-accent-muted)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:border-[var(--color-border)]/60"
                    )}
                  >
                    <p className={cn(
                      "text-sm font-medium",
                      visibility === opt.value ? "text-[var(--color-accent)]" : "text-foreground"
                    )}>
                      {opt.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Interests */}
      <motion.div variants={item}>
        <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Heart weight="light" className="h-4 w-4 text-[var(--color-accent)]" />
              Interests & Desires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InterestSelector
              selectedInterests={interests}
              onChange={setInterests}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Boundaries */}
      <motion.div variants={item}>
        <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield weight="light" className="h-4 w-4 text-[var(--color-accent)]" />
              Boundaries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add form */}
            <div className="space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={newBoundary.type}
                    onValueChange={(val) =>
                      setNewBoundary({
                        ...newBoundary,
                        type: val as Boundary["type"],
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
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Describe your boundary..."
                  value={newBoundary.description}
                  onChange={(e) =>
                    setNewBoundary({ ...newBoundary, description: e.target.value })
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
                  <Plus weight="bold" className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* List */}
            {boundaries.length > 0 ? (
              <div className="space-y-2">
                {boundaries.map((b) => (
                  <div
                    key={b.id}
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
                      <Trash weight="light" className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No boundaries defined. Add some above.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom save button */}
      <motion.div variants={item} className="flex justify-end pb-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
        >
          {saving ? (
            <LoadingSpinner size="sm" />
          ) : saved ? (
            <>
              <Check weight="bold" className="mr-2 h-4 w-4" />
              Saved Successfully
            </>
          ) : (
            <>
              <FloppyDisk weight="light" className="mr-2 h-4 w-4" />
              Save All Changes
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
