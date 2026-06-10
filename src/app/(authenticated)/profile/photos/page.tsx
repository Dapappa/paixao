"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/lib/hooks/use-profile";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import type { Photo } from "@/lib/stores/auth-store";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Camera,
  Crown,
  EyeSlash,
  ImagesSquare,
  Lock,
  Shield,
  Trash,
} from "@phosphor-icons/react/ssr";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function PhotosPage() {
  const router = useRouter();
  const { profile, loading, updateProfile } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>(profile?.photos || []);

  // Sync when profile loads
  useState(() => {
    if (profile?.photos) setPhotos(profile.photos);
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);

    // For now, create placeholder entries (real implementation would use Supabase Storage)
    const newPhotos: Photo[] = Array.from(files).map((file, idx) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      is_primary: photos.length === 0 && idx === 0,
      is_private: false,
      is_nsfw: false,
      order: photos.length + idx,
    }));

    const updated = [...photos, ...newPhotos];
    setPhotos(updated);
    setUploading(false);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const setPrimary = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => ({ ...p, is_primary: p.id === id }))
    );
  };

  const togglePrivate = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, is_private: !p.is_private } : p
      )
    );
  };

  const toggleNsfw = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, is_nsfw: !p.is_nsfw } : p
      )
    );
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      // If we removed the primary, make the first one primary
      if (filtered.length > 0 && !filtered.some((p) => p.is_primary)) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
  };

  const moveUp = (id: string) => {
    setPhotos((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx <= 0) return prev;
      const newArr = [...prev];
      [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
      return newArr.map((p, i) => ({ ...p, order: i }));
    });
  };

  const moveDown = (id: string) => {
    setPhotos((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx >= prev.length - 1) return prev;
      const newArr = [...prev];
      [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]];
      return newArr.map((p, i) => ({ ...p, order: i }));
    });
  };

  const handleSave = async () => {
    try {
      await updateProfile({ photos });
    } catch (error) {
      console.error("Failed to save photos:", error);
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
            <h1 className="text-xl font-bold text-foreground">Photos</h1>
            <p className="text-sm text-muted-foreground">
              Manage your profile photos
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
        >
          Save
        </Button>
      </motion.div>

      {/* Upload Area */}
      <motion.div variants={item}>
        <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
          <CardContent className="p-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8 transition-colors hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent-muted)]"
            >
              {uploading ? (
                <LoadingSpinner size="md" />
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-muted)]">
                    <ImagesSquare weight="duotone" className="h-7 w-7 text-[var(--color-accent)]" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Upload Photos
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, or WebP. Max 10MB each.
                    </p>
                  </div>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Photo Grid */}
      {photos.length > 0 ? (
        <motion.div variants={item}>
          <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Camera weight="light" className="h-4 w-4 text-[var(--color-accent)]" />
                Your Photos ({photos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <AnimatePresence>
                  {photos.map((photo, index) => (
                    <motion.div
                      key={photo.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
                    >
                      {/* Image */}
                      <div className="relative aspect-square">
                        <img
                          src={photo.url}
                          alt={`Photo ${index + 1}`}
                          className={cn(
                            "h-full w-full object-cover",
                            photo.is_nsfw && "blur-lg"
                          )}
                        />

                        {/* Badges overlay */}
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          {photo.is_primary && (
                            <Badge className="bg-[var(--color-accent)] text-white text-[10px] px-1.5">
                              <Crown weight="fill" className="mr-1 h-3 w-3" />
                              Primary
                            </Badge>
                          )}
                          {photo.is_private && (
                            <Badge className="bg-[var(--color-surface)]/80 text-foreground text-[10px] px-1.5 backdrop-blur-sm">
                              <Lock weight="light" className="mr-1 h-3 w-3" />
                              Private
                            </Badge>
                          )}
                          {photo.is_nsfw && (
                            <Badge className="bg-[var(--color-warning)]/80 text-white text-[10px] px-1.5">
                              <EyeSlash weight="light" className="mr-1 h-3 w-3" />
                              NSFW
                            </Badge>
                          )}
                        </div>

                        {/* Reorder buttons */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => moveUp(photo.id)}
                            disabled={index === 0}
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-surface)]/80 text-foreground backdrop-blur-sm hover:bg-[var(--color-surface)] disabled:opacity-30"
                          >
                            <ArrowUp weight="bold" className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => moveDown(photo.id)}
                            disabled={index === photos.length - 1}
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-surface)]/80 text-foreground backdrop-blur-sm hover:bg-[var(--color-surface)] disabled:opacity-30"
                          >
                            <ArrowDown weight="bold" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={photo.is_primary}
                              onCheckedChange={() => setPrimary(photo.id)}
                              className="data-[state=checked]:bg-[var(--color-accent)]"
                            />
                            <Label className="text-xs">Primary</Label>
                          </div>
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="text-muted-foreground hover:text-[var(--color-danger)] transition-colors"
                          >
                            <Trash weight="light" className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={photo.is_private}
                              onCheckedChange={() => togglePrivate(photo.id)}
                              className="data-[state=checked]:bg-[var(--color-accent)]"
                            />
                            <Label className="text-xs">Private</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={photo.is_nsfw}
                              onCheckedChange={() => toggleNsfw(photo.id)}
                              className="data-[state=checked]:bg-[var(--color-warning)]"
                            />
                            <Label className="text-xs">NSFW</Label>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={item}>
          <EmptyState
            icon={Camera}
            title="No Photos Yet"
            description="Upload some photos to make your profile stand out. Your primary photo is the first thing others see."
            action={{
              label: "Upload Your First Photo",
              onClick: () => fileInputRef.current?.click(),
            }}
          />
        </motion.div>
      )}

      {/* Guidelines */}
      <motion.div variants={item}>
        <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield weight="duotone" className="h-5 w-5 text-[var(--color-gold)] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Photo Guidelines
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>- Photos must be of you (no stock photos or others&apos; images)</li>
                  <li>- NSFW photos are blurred by default and only shown with consent</li>
                  <li>- Private photos are only visible to your matches</li>
                  <li>- All photos must comply with community guidelines</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
