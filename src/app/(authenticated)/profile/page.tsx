"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/lib/hooks/use-profile";
import { findInterestById, findCategoryByInterestId } from "@/config/interests";
import { motion } from "framer-motion";
import {
  Camera,
  PencilSimple,
  Heart,
  MapPin,
  Shield,
  Star,
  User,
} from "@phosphor-icons/react/ssr";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-3 flex-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

const levelColors: Record<string, string> = {
  curious: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  interested: "bg-green-500/15 text-green-400 border-green-500/30",
  experienced:
    "bg-[var(--color-gold)]/15 text-[var(--color-gold)] border-[var(--color-gold)]/30",
  expert:
    "bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/30",
};

export default function ProfilePage() {
  const { profile, loading } = useProfile();

  if (loading) return <ProfileSkeleton />;

  const displayName = profile?.display_name || "Anonymous";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const profileFields = [
    profile?.display_name,
    profile?.avatar_url,
    profile?.bio,
    profile?.gender,
    profile?.sexuality,
    profile?.relationship_status,
    profile?.location,
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const completionPercent = Math.round(
    (completedFields / profileFields.length) * 100
  );

  const activeInterests =
    profile?.interests?.filter((i) => !i.is_hard_limit) || [];
  const hardLimits =
    profile?.interests?.filter((i) => i.is_hard_limit) || [];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Profile Header */}
      <motion.div variants={item}>
        <Card className="border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          {/* Cover gradient */}
          <div className="h-24 bg-gradient-to-r from-[var(--color-accent)]/20 via-[var(--color-surface)] to-[var(--color-gold)]/20" />

          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              {/* Avatar */}
              <Avatar className="h-24 w-24 border-4 border-[var(--color-surface)] shadow-xl">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 sm:pb-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">
                    {displayName}
                  </h1>
                  {profile?.subscription_tier &&
                    profile.subscription_tier !== "curious" && (
                      <Badge className="bg-[var(--color-gold)]/15 text-[var(--color-gold)] border-[var(--color-gold)]/30">
                        <Star weight="fill" className="mr-1 h-3 w-3" />
                        {profile.subscription_tier}
                      </Badge>
                    )}
                </div>
                {profile?.tagline && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.tagline}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {profile?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin weight="light" className="h-3.5 w-3.5" />
                      {profile.location}
                    </span>
                  )}
                  {profile?.pronouns && (
                    <span className="flex items-center gap-1">
                      <User weight="light" className="h-3.5 w-3.5" />
                      {profile.pronouns}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 sm:pb-1">
                <Link href="/profile/edit">
                  <Button className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]">
                    <PencilSimple weight="light" className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/profile/photos">
                  <Button
                    variant="outline"
                    className="border-[var(--color-border)]"
                  >
                    <Camera weight="light" className="mr-2 h-4 w-4" />
                    Photos
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Completion */}
      {completionPercent < 100 && (
        <motion.div variants={item}>
          <Card className="border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="relative h-12 w-12 shrink-0">
                <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    strokeWidth="4"
                    fill="none"
                    className="stroke-[var(--color-border)]"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${(completionPercent / 100) * 125.6} 125.6`}
                    strokeLinecap="round"
                    className="stroke-[var(--color-accent)] transition-all duration-1000"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[var(--color-accent)]">
                  {completionPercent}%
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Complete Your Profile
                </p>
                <p className="text-xs text-muted-foreground">
                  A complete profile helps others understand you better
                </p>
              </div>
              <Link href="/profile/edit">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[var(--color-accent)]/30 text-[var(--color-accent)]"
                >
                  Complete
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bio */}
        <motion.div variants={item}>
          <Card className="border-[var(--color-border)] bg-[var(--color-surface)] h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User weight="light" className="h-4 w-4 text-[var(--color-accent)]" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.bio ? (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No bio yet. Tell others about yourself.
                </p>
              )}

              <Separator className="bg-[var(--color-border)]" />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Gender</p>
                  <p className="text-foreground font-medium">
                    {profile?.gender || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Sexuality</p>
                  <p className="text-foreground font-medium">
                    {profile?.sexuality || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <p className="text-foreground font-medium">
                    {profile?.relationship_status || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Experience</p>
                  <p className="text-foreground font-medium capitalize">
                    {profile?.experience_level || "Not set"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Interests */}
        <motion.div variants={item}>
          <Card className="border-[var(--color-border)] bg-[var(--color-surface)] h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Heart weight="light" className="h-4 w-4 text-[var(--color-accent)]" />
                Interests
                {activeInterests.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {activeInterests.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeInterests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activeInterests.map((interest) => {
                    const info = findInterestById(interest.interest_id);
                    if (!info) return null;
                    return (
                      <Badge
                        key={interest.interest_id}
                        variant="outline"
                        className={cn(
                          "text-xs",
                          levelColors[interest.level] ||
                            "border-[var(--color-border)]"
                        )}
                      >
                        {info.emoji && (
                          <span className="mr-1">{info.emoji}</span>
                        )}
                        {info.label}
                      </Badge>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No interests added yet.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Boundaries */}
        <motion.div variants={item}>
          <Card className="border-[var(--color-border)] bg-[var(--color-surface)] h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield weight="light" className="h-4 w-4 text-[var(--color-accent)]" />
                Boundaries
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.boundaries && profile.boundaries.length > 0 ? (
                <div className="space-y-2">
                  {profile.boundaries.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-2 text-sm"
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
                      <span className="text-foreground">{b.description}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No boundaries defined yet.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Photos */}
        <motion.div variants={item}>
          <Card className="border-[var(--color-border)] bg-[var(--color-surface)] h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera weight="light" className="h-4 w-4 text-[var(--color-accent)]" />
                Photos
              </CardTitle>
              <Link href="/profile/photos">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--color-accent)]"
                >
                  Manage
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {profile?.photos && profile.photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {profile.photos.slice(0, 6).map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-square overflow-hidden rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]"
                    >
                      <img
                        src={photo.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      {photo.is_primary && (
                        <Badge className="absolute top-1 left-1 text-[9px] bg-[var(--color-accent)] text-white px-1.5 py-0">
                          Primary
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 text-center">
                  <Camera weight="duotone" className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No photos uploaded yet
                  </p>
                  <Link href="/profile/photos">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 border-[var(--color-border)]"
                    >
                      Upload Photos
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
