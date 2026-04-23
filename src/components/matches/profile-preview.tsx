"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  X,
  MessageCircle,
  Shield,
  Flag,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Users,
  Eye,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */

interface ProfilePhoto {
  id: string;
  url: string;
  is_primary: boolean;
  is_private: boolean;
  is_nsfw: boolean;
  order: number;
}

interface ProfileInterest {
  id: string;
  name: string;
  category: string;
  emoji: string;
  level: string;
  is_hard_limit: boolean;
  is_shared: boolean;
}

export interface ProfileData {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  tagline: string | null;
  bio: string | null;
  gender: string | null;
  pronouns: string | null;
  sexuality: string | null;
  relationship_status: string | null;
  looking_for: string[];
  location: string | null;
  experience_level: string | null;
  date_of_birth: string | null;
  created_at: string;
  photos: ProfilePhoto[];
  interests: ProfileInterest[];
  compatibility_score: number;
  shared_interest_count: number;
  is_matched: boolean;
  match_id: string | null;
  conversation_id: string | null;
}

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

function calculateAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

const experienceLabels: Record<string, string> = {
  curious: "Curious",
  beginner: "Beginner",
  intermediate: "Intermediate",
  experienced: "Experienced",
  expert: "Expert",
};

const interestCategoryColors: Record<string, string> = {
  bondage: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  impact: "bg-red-500/15 text-red-400 border-red-500/30",
  power_exchange: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  sensory: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  role_play: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  fetish: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  relationship: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  default: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

/* ─────────────────────────────────────────────
   ProfilePreview
   ───────────────────────────────────────────── */

interface ProfilePreviewProps {
  profile: ProfileData;
  onLike?: () => void;
  onPass?: () => void;
  onMessage?: () => void;
  onBlock?: () => void;
  onReport?: () => void;
  className?: string;
}

export function ProfilePreview({
  profile,
  onLike,
  onPass,
  onMessage,
  onBlock,
  onReport,
  className,
}: ProfilePreviewProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const age = calculateAge(profile.date_of_birth);
  const sortedPhotos = [...profile.photos].sort((a, b) => a.order - b.order);
  const currentPhoto = sortedPhotos[currentPhotoIndex];

  const sharedInterests = profile.interests.filter((i) => i.is_shared);
  const otherInterests = profile.interests.filter((i) => !i.is_shared);

  // Group interests by category
  const interestsByCategory = profile.interests.reduce(
    (acc, interest) => {
      const cat = interest.category || "default";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(interest);
      return acc;
    },
    {} as Record<string, ProfileInterest[]>
  );

  const nextPhoto = () => {
    if (currentPhotoIndex < sortedPhotos.length - 1) {
      setCurrentPhotoIndex((prev) => prev + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex((prev) => prev - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("max-w-2xl mx-auto space-y-6", className)}
    >
      {/* Photo section */}
      <div className="relative rounded-2xl overflow-hidden bg-surface aspect-[4/5] max-h-[600px]">
        {sortedPhotos.length > 0 && currentPhoto ? (
          <>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentPhoto.id}
                src={currentPhoto.url}
                alt=""
                className="h-full w-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>

            {/* Photo indicators */}
            {sortedPhotos.length > 1 && (
              <div className="absolute top-3 left-3 right-3 flex gap-1">
                {sortedPhotos.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      idx === currentPhotoIndex
                        ? "bg-white"
                        : "bg-white/30"
                    )}
                  />
                ))}
              </div>
            )}

            {/* Photo navigation */}
            {sortedPhotos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  disabled={currentPhotoIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white disabled:opacity-30 hover:bg-black/60 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextPhoto}
                  disabled={currentPhotoIndex === sortedPhotos.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white disabled:opacity-30 hover:bg-black/60 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Private badge */}
            {currentPhoto.is_private && (
              <Badge className="absolute top-4 right-4 bg-black/50 text-white border-0 backdrop-blur-sm">
                <Eye className="mr-1 h-3 w-3" />
                Private
              </Badge>
            )}
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[var(--color-accent)]/10 via-surface to-surface-elevated flex items-center justify-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-serif text-5xl">
                {(profile.display_name || "?")[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Name info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-baseline gap-2 mb-1">
            <h1 className="font-serif text-3xl font-bold text-white">
              {profile.display_name || "Anonymous"}
            </h1>
            {age && (
              <span className="text-xl text-white/70 font-light">{age}</span>
            )}
          </div>
          {profile.tagline && (
            <p className="text-white/70 text-sm">{profile.tagline}</p>
          )}
        </div>

        {/* Compatibility score */}
        {profile.compatibility_score > 0 && (
          <div className="absolute top-4 left-4">
            <Badge
              className={cn(
                "border-0 backdrop-blur-md text-sm font-bold px-3 py-1.5",
                profile.compatibility_score >= 70
                  ? "bg-[var(--color-gold)]/90 text-black"
                  : profile.compatibility_score >= 40
                    ? "bg-[var(--color-accent)]/80 text-white"
                    : "bg-white/20 text-white"
              )}
            >
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              {profile.compatibility_score}% match
            </Badge>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-center gap-3">
        {!profile.is_matched && onPass && (
          <Button
            size="icon"
            variant="outline"
            onClick={onPass}
            className="h-12 w-12 rounded-full border-2 border-red-400/30 text-red-400 hover:bg-red-500/10 hover:border-red-400"
          >
            <X className="h-5 w-5" />
          </Button>
        )}

        {!profile.is_matched && onLike && (
          <Button
            size="icon"
            onClick={onLike}
            className="h-14 w-14 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white hover:shadow-[0_0_25px_rgba(194,24,91,0.4)] transition-shadow"
          >
            <Heart className="h-6 w-6" />
          </Button>
        )}

        {profile.is_matched && profile.conversation_id && onMessage && (
          <Button
            onClick={onMessage}
            className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-[0_0_20px_rgba(194,24,91,0.2)]"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Send Message
          </Button>
        )}

        {onBlock && (
          <Button
            size="icon"
            variant="outline"
            onClick={onBlock}
            className="h-10 w-10 rounded-full border-border text-muted-foreground hover:text-foreground"
          >
            <Shield className="h-4 w-4" />
          </Button>
        )}

        {onReport && (
          <Button
            size="icon"
            variant="outline"
            onClick={onReport}
            className="h-10 w-10 rounded-full border-border text-muted-foreground hover:text-foreground"
          >
            <Flag className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Profile details */}
      <div className="space-y-5 rounded-2xl border border-border bg-surface p-6">
        {/* About */}
        {profile.bio && (
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              About
            </h3>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3">
          {profile.gender && (
            <DetailItem label="Gender" value={profile.gender} />
          )}
          {profile.pronouns && (
            <DetailItem label="Pronouns" value={profile.pronouns} />
          )}
          {profile.sexuality && (
            <DetailItem label="Sexuality" value={profile.sexuality} />
          )}
          {profile.relationship_status && (
            <DetailItem
              label="Relationship"
              value={profile.relationship_status}
            />
          )}
          {profile.experience_level && (
            <DetailItem
              label="Experience"
              value={
                experienceLabels[profile.experience_level] ||
                profile.experience_level
              }
            />
          )}
          {profile.location && (
            <DetailItem
              label="Location"
              value={profile.location}
              icon={<MapPin className="h-3.5 w-3.5 text-[var(--color-accent)]" />}
            />
          )}
        </div>

        {/* Looking for */}
        {profile.looking_for && profile.looking_for.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              <Users className="inline h-3.5 w-3.5 mr-1" />
              Looking For
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.looking_for.map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="text-xs border-border text-muted-foreground"
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interests */}
      {profile.interests.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Interests & Kinks
          </h3>

          {/* Shared interests first */}
          {sharedInterests.length > 0 && (
            <div>
              <p className="text-xs text-[var(--color-gold)] mb-2 font-medium">
                <Sparkles className="inline h-3 w-3 mr-1" />
                {sharedInterests.length} shared{" "}
                {sharedInterests.length === 1 ? "interest" : "interests"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sharedInterests.map((interest) => (
                  <Badge
                    key={interest.id}
                    variant="outline"
                    className="text-xs border-[var(--color-gold)]/40 text-[var(--color-gold)] bg-[var(--color-gold)]/5"
                  >
                    {interest.emoji && (
                      <span className="mr-0.5">{interest.emoji}</span>
                    )}
                    {interest.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Other interests by category */}
          {otherInterests.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {otherInterests.map((interest) => {
                const catColor =
                  interestCategoryColors[interest.category] ||
                  interestCategoryColors.default;
                return (
                  <Badge
                    key={interest.id}
                    variant="outline"
                    className={cn("text-xs border", catColor)}
                  >
                    {interest.emoji && (
                      <span className="mr-0.5">{interest.emoji}</span>
                    )}
                    {interest.name}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Detail Item helper
   ───────────────────────────────────────────── */

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-surface-elevated p-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm text-foreground font-medium flex items-center gap-1.5">
        {icon}
        <span className="capitalize">{value.replace(/_/g, " ")}</span>
      </p>
    </div>
  );
}
