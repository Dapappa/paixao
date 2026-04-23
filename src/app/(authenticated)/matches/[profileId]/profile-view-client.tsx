"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ProfilePreview,
  type ProfileData,
} from "@/components/matches/profile-preview";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useMatchAction } from "@/lib/hooks/use-matches";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

/* ─────────────────────────────────────────────
   ProfileViewClient
   ───────────────────────────────────────────── */

interface ProfileViewClientProps {
  profileId: string;
  initialProfile: ProfileData | null;
}

export function ProfileViewClient({
  profileId,
  initialProfile,
}: ProfileViewClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(initialProfile);
  const [loading, setLoading] = useState(!initialProfile);
  const [error, setError] = useState<string | null>(null);
  const { performAction } = useMatchAction();

  // Fetch profile if not provided by server
  useEffect(() => {
    if (initialProfile) return;

    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch(`/api/profiles/${profileId}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Profile not found");
        }
        const data = await res.json();
        setProfile(data.profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [profileId, initialProfile]);

  const handleLike = useCallback(async () => {
    if (!profile) return;
    const result = await performAction(profile.id, "like");
    if (result?.matched) {
      // Refresh to show matched state
      const res = await fetch(`/api/profiles/${profileId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    }
  }, [profile, performAction, profileId]);

  const handlePass = useCallback(async () => {
    if (!profile) return;
    await performAction(profile.id, "pass");
    router.push("/matches");
  }, [profile, performAction, router]);

  const handleMessage = useCallback(() => {
    if (profile?.conversation_id) {
      router.push(`/messages/${profile.conversation_id}`);
    }
  }, [profile, router]);

  const handleBlock = useCallback(() => {
    // Would open a confirmation dialog in full implementation
    if (confirm("Are you sure you want to block this user?")) {
      // Block API call would go here
      router.push("/matches");
    }
  }, [router]);

  const handleReport = useCallback(() => {
    // Would open a report dialog in full implementation
    alert("Report functionality will be available soon.");
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <Link
          href="/matches"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Discover
        </Link>
        <div className="rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-6 text-center">
          <p className="text-sm text-[var(--color-danger)]">
            {error || "Profile not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/matches"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Discover
      </Link>

      {/* Profile */}
      <ProfilePreview
        profile={profile}
        onLike={handleLike}
        onPass={handlePass}
        onMessage={profile.is_matched ? handleMessage : undefined}
        onBlock={handleBlock}
        onReport={handleReport}
      />
    </div>
  );
}
