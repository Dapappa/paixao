"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Warning,
  UserMinus,
  Baby,
  ImageBroken,
  ChatCenteredDots,
  UsersThree,
  Prohibit,
  Question,
  CaretLeft,
  CaretRight,
  Plus,
  X,
  CheckCircle,
  CircleNotch,
} from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSafety } from "@/lib/hooks/use-safety";
import type { ReportInput } from "@/lib/utils/validators";

/* ─────────────────────────────────────────────
   Category definitions
   ───────────────────────────────────────────── */

const CATEGORIES = [
  {
    value: "harassment" as const,
    label: "Harassment",
    description: "Bullying, threats, or intimidation",
    icon: UserMinus,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
  {
    value: "consent_violation" as const,
    label: "Consent Violation",
    description: "Boundaries crossed without permission",
    icon: Warning,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
  },
  {
    value: "underage_suspicion" as const,
    label: "Underage Suspicion",
    description: "User may be under 18",
    icon: Baby,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
  {
    value: "inappropriate_content" as const,
    label: "Inappropriate Content",
    description: "Unwanted explicit material",
    icon: ImageBroken,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
  },
  {
    value: "spam" as const,
    label: "Spam",
    description: "Unsolicited or repetitive messages",
    icon: ChatCenteredDots,
    color: "text-zinc-400",
    bg: "bg-zinc-500/10 border-zinc-500/20",
  },
  {
    value: "impersonation" as const,
    label: "Impersonation",
    description: "Pretending to be someone else",
    icon: UsersThree,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    value: "unsafe_behavior" as const,
    label: "Unsafe Behavior",
    description: "Actions that endanger safety",
    icon: Shield,
    color: "text-[#c2185b]",
    bg: "bg-[#c2185b]/10 border-[#c2185b]/20",
  },
  {
    value: "discrimination" as const,
    label: "Discrimination",
    description: "Hate speech or prejudice",
    icon: Prohibit,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    value: "other" as const,
    label: "Other",
    description: "Something else not listed above",
    icon: Question,
    color: "text-zinc-400",
    bg: "bg-zinc-500/10 border-zinc-500/20",
  },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

/* ─────────────────────────────────────────────
   Props
   ───────────────────────────────────────────── */

interface ReportFormProps {
  reported_user_id?: string;
  reported_event_id?: string;
  reported_message_id?: string;
  /** Render inside a dialog (default) or inline */
  asDialog?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */

export function ReportForm({
  reported_user_id,
  reported_event_id,
  reported_message_id,
  asDialog = true,
  open,
  onOpenChange,
  className,
}: ReportFormProps) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState("");
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [success, setSuccess] = useState(false);

  const { submitReport, loading } = useSafety();

  const reset = () => {
    setStep(1);
    setCategory(null);
    setDescription("");
    setEvidenceUrls([]);
    setNewUrl("");
    setSuccess(false);
  };

  const handleSubmit = async () => {
    if (!category) return;

    const data: ReportInput = {
      category,
      description,
      evidence_urls: evidenceUrls.length > 0 ? evidenceUrls : undefined,
      reported_user_id,
      reported_event_id,
      reported_message_id,
    };

    const result = await submitReport(data);
    if (result) {
      setSuccess(true);
    }
  };

  const addUrl = () => {
    const trimmed = newUrl.trim();
    if (trimmed && !evidenceUrls.includes(trimmed)) {
      setEvidenceUrls((prev) => [...prev, trimmed]);
      setNewUrl("");
    }
  };

  const removeUrl = (index: number) => {
    setEvidenceUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const selectedCategory = CATEGORIES.find((c) => c.value === category);

  const canProceedStep2 = description.length >= 10;

  /* ── Step content ── */

  const stepContent = (
    <div className={cn("space-y-6", className)}>
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              s === step
                ? "w-8 bg-[#c2185b]"
                : s < step
                  ? "w-2 bg-[#c2185b]/50"
                  : "w-2 bg-zinc-700"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle weight="duotone" className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Report Submitted
            </h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Thank you for helping keep our community safe. Our team will review
              your report within 24 hours.
            </p>
            <Button
              variant="outline"
              className="mt-6 border-zinc-700"
              onClick={() => {
                reset();
                onOpenChange?.(false);
              }}
            >
              Close
            </Button>
          </motion.div>
        ) : step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="mb-1 text-lg font-semibold text-foreground">
              What are you reporting?
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Select the category that best describes the issue.
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 text-left transition-all",
                      isSelected
                        ? "border-[#c2185b] bg-[#c2185b]/10"
                        : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-800/50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                        isSelected ? "border-[#c2185b]/30 bg-[#c2185b]/10" : cat.bg
                      )}
                    >
                      <Icon
                        weight="light"
                        className={cn(
                          "h-4 w-4",
                          isSelected ? "text-[#c2185b]" : cat.color
                        )}
                      />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          isSelected ? "text-[#c2185b]" : "text-foreground"
                        )}
                      >
                        {cat.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cat.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!category}
                className="bg-[#c2185b] text-white hover:bg-[#c2185b]/90"
              >
                Continue
                <CaretRight weight="bold" className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ) : step === 2 ? (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="mb-1 text-lg font-semibold text-foreground">
              Tell us more
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Please describe what happened. The more detail you provide, the
              better we can help.
            </p>

            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail (minimum 10 characters)..."
              className="min-h-[120px] border-zinc-800 bg-zinc-900/50 focus:border-[#c2185b]"
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {description.length}/2000 characters
            </p>

            {/* Evidence URLs */}
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Evidence URLs (optional)
              </label>
              <div className="flex gap-2">
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  className="border-zinc-800 bg-zinc-900/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addUrl();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addUrl}
                  className="shrink-0 border-zinc-700"
                >
                  <Plus weight="bold" className="h-4 w-4" />
                </Button>
              </div>
              {evidenceUrls.length > 0 && (
                <div className="mt-2 space-y-1">
                  {evidenceUrls.map((url, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-md bg-zinc-900/50 px-3 py-1.5 text-xs"
                    >
                      <span className="min-w-0 truncate text-muted-foreground">
                        {url}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeUrl(i)}
                        className="shrink-0 text-zinc-500 hover:text-red-400"
                      >
                        <X weight="bold" className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="text-muted-foreground"
              >
                <CaretLeft weight="bold" className="mr-1 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="bg-[#c2185b] text-white hover:bg-[#c2185b]/90"
              >
                Review
                <CaretRight weight="bold" className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="mb-1 text-lg font-semibold text-foreground">
              Review your report
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Please confirm the details before submitting.
            </p>

            <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
              {/* Category */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Category
                </p>
                <div className="mt-1 flex items-center gap-2">
                  {selectedCategory && (
                    <>
                      <selectedCategory.icon
                        weight="light"
                        className={cn("h-4 w-4", selectedCategory.color)}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {selectedCategory.label}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Description
                </p>
                <p className="mt-1 text-sm text-foreground/80">
                  {description}
                </p>
              </div>

              {/* Evidence */}
              {evidenceUrls.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Evidence ({evidenceUrls.length} URL
                    {evidenceUrls.length !== 1 ? "s" : ""})
                  </p>
                  <div className="mt-1 space-y-1">
                    {evidenceUrls.map((url, i) => (
                      <p
                        key={i}
                        className="truncate text-xs text-[#d4a574]"
                      >
                        {url}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep(2)}
                className="text-muted-foreground"
              >
                <CaretLeft weight="bold" className="mr-1 h-4 w-4" />
                Edit
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#c2185b] text-white hover:bg-[#c2185b]/90"
              >
                {loading ? (
                  <>
                    <CircleNotch weight="bold" className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (!asDialog) return stepContent;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) reset();
        onOpenChange?.(val);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto border-zinc-800 bg-[#0a0a0a] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Shield weight="light" className="h-5 w-5 text-[#c2185b]" />
            Report an Issue
          </DialogTitle>
          <DialogDescription>
            Your report is confidential. We take every report seriously.
          </DialogDescription>
        </DialogHeader>
        {stepContent}
      </DialogContent>
    </Dialog>
  );
}
