"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  X,
  CircleNotch,
  Info,
  CalendarDots,
  MapPin,
  Shield,
  Eye,
  Sparkle,
} from "@phosphor-icons/react/ssr";
import { format } from "date-fns";
import { toast } from "sonner";

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */

interface FormData {
  // Step 1 — Basic Info
  title: string;
  short_description: string;
  description: string;
  event_type: string;
  theme: string;
  cover_image_url: string;

  // Step 2 — Schedule
  starts_at: string;
  ends_at: string;
  timezone: string;

  // Step 3 — Location / Virtual
  format: string;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  venue_province: string;
  venue_instructions: string;
  virtual_room_url: string;
  virtual_platform: string;

  // Step 4 — Rules & Consent
  rules: string[];
  consent_requirements: string[];
  dress_code: string;
  byob: boolean;
  catering_included: boolean;
  capacity: string;
  min_age: string;
  requires_verification: boolean;
  ticket_price_cents: string;
  currency: string;
}

const INITIAL_DATA: FormData = {
  title: "",
  short_description: "",
  description: "",
  event_type: "",
  theme: "",
  cover_image_url: "",
  starts_at: "",
  ends_at: "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  format: "",
  venue_name: "",
  venue_address: "",
  venue_city: "",
  venue_province: "",
  venue_instructions: "",
  virtual_room_url: "",
  virtual_platform: "",
  rules: [],
  consent_requirements: [],
  dress_code: "",
  byob: false,
  catering_included: false,
  capacity: "",
  min_age: "18",
  requires_verification: false,
  ticket_price_cents: "0",
  currency: "CAD",
};

const STEPS = [
  { id: 1, label: "Basic Info", icon: Sparkle },
  { id: 2, label: "Schedule", icon: CalendarDots },
  { id: 3, label: "Location", icon: MapPin },
  { id: 4, label: "Rules", icon: Shield },
  { id: 5, label: "Review", icon: Eye },
];

const EVENT_TYPES = [
  { value: "munch", label: "Munch" },
  { value: "play_party", label: "Play Party" },
  { value: "workshop", label: "Workshop" },
  { value: "social", label: "Social" },
  { value: "dungeon", label: "Dungeon" },
  { value: "retreat", label: "Retreat" },
  { value: "conference", label: "Conference" },
  { value: "other", label: "Other" },
];

const FORMAT_OPTIONS = [
  { value: "in_person", label: "In Person" },
  { value: "virtual", label: "Virtual" },
  { value: "hybrid", label: "Hybrid" },
];

/* ─────────────────────────────────────────────
   Step indicator
   ───────────────────────────────────────────── */

function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8">
      {STEPS.map((step) => {
        const StepIcon = step.icon;
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;

        return (
          <div key={step.id} className="flex items-center gap-1 sm:gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2 sm:px-3 py-1.5 text-xs font-medium transition-all duration-300",
                isActive &&
                  "bg-[var(--color-accent)] text-white shadow-[0_0_15px_rgba(194,24,91,0.3)]",
                isCompleted &&
                  "bg-[var(--color-accent-muted)] text-[var(--color-accent)]",
                !isActive &&
                  !isCompleted &&
                  "bg-surface text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check weight="bold" className="h-3 w-3" />
              ) : (
                <StepIcon weight="duotone" className="h-3 w-3" />
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {step.id < totalSteps && (
              <div
                className={cn(
                  "h-px w-4 sm:w-8 transition-colors duration-300",
                  step.id < currentStep
                    ? "bg-[var(--color-accent)]"
                    : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   List editor (for rules / consent items)
   ───────────────────────────────────────────── */

function ListEditor({
  items,
  onAdd,
  onRemove,
  placeholder,
  label,
}: {
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
  label: string;
}) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const val = input.trim();
    if (val) {
      onAdd(val);
      setInput("");
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-foreground">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="bg-background border-border flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleAdd}
          className="shrink-0 border-border"
        >
          <Plus weight="bold" className="h-4 w-4" />
        </Button>
      </div>
      <AnimatePresence>
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 rounded-lg bg-surface-elevated p-2.5 border border-border"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-muted)] text-[10px] font-bold text-[var(--color-accent)]">
              {idx + 1}
            </span>
            <span className="flex-1 text-sm text-foreground">{item}</span>
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="text-muted-foreground hover:text-[var(--color-danger)] transition-colors"
            >
              <X weight="bold" className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   EventCreateForm
   ───────────────────────────────────────────── */

export function EventCreateForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );

  const updateField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    []
  );

  /* Validation per step */
  const validateStep = (s: number): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};

    if (s === 1) {
      if (!formData.title.trim()) errs.title = "Title is required";
      if (formData.title.length > 120)
        errs.title = "Title must be under 120 characters";
      if (!formData.description.trim())
        errs.description = "Description is required";
      if (formData.description.length < 20)
        errs.description = "At least 20 characters";
      if (!formData.event_type) errs.event_type = "Select an event type";
    }

    if (s === 2) {
      if (!formData.starts_at) errs.starts_at = "Start date is required";
      if (!formData.ends_at) errs.ends_at = "End date is required";
      if (
        formData.starts_at &&
        formData.ends_at &&
        new Date(formData.ends_at) <= new Date(formData.starts_at)
      ) {
        errs.ends_at = "End date must be after start date";
      }
    }

    if (s === 3) {
      if (!formData.format) errs.format = "Select a format";
      const needsVenue =
        formData.format === "in_person" || formData.format === "hybrid";
      const needsVirtual =
        formData.format === "virtual" || formData.format === "hybrid";

      if (needsVenue && !formData.venue_city.trim())
        errs.venue_city = "City is required for in-person events";
      if (needsVirtual && !formData.virtual_room_url.trim())
        errs.virtual_room_url = "Virtual room URL is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 5));
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  /* Submit */
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        short_description: formData.short_description.trim() || undefined,
        description: formData.description.trim(),
        event_type: formData.event_type,
        theme: formData.theme.trim() || undefined,
        cover_image_url: formData.cover_image_url.trim() || undefined,
        starts_at: formData.starts_at,
        ends_at: formData.ends_at,
        timezone: formData.timezone,
        format: formData.format,
        venue_name: formData.venue_name.trim() || undefined,
        venue_address: formData.venue_address.trim() || undefined,
        venue_city: formData.venue_city.trim() || undefined,
        venue_province: formData.venue_province.trim() || undefined,
        venue_instructions: formData.venue_instructions.trim() || undefined,
        virtual_room_url: formData.virtual_room_url.trim() || undefined,
        virtual_platform: formData.virtual_platform.trim() || undefined,
        rules: formData.rules,
        consent_requirements: formData.consent_requirements,
        dress_code: formData.dress_code.trim() || undefined,
        byob: formData.byob,
        catering_included: formData.catering_included,
        capacity: formData.capacity ? Number(formData.capacity) : undefined,
        min_age: Number(formData.min_age) || 18,
        requires_verification: formData.requires_verification,
        ticket_price_cents: Number(formData.ticket_price_cents) || 0,
        currency: formData.currency || "CAD",
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create event");
      }

      toast.success("Event created successfully!");
      router.push("/events/my-events");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create event"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Step renders ─── */

  const renderStep1 = () => (
    <div className="space-y-5">
      <div>
        <Label htmlFor="title" className="text-foreground">
          Event Title <span className="text-[var(--color-accent)]">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="e.g., Moonlit Masquerade Social"
          className="mt-1.5 bg-background border-border"
          maxLength={120}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-[var(--color-danger)]">
            {errors.title}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {formData.title.length}/120
        </p>
      </div>

      <div>
        <Label htmlFor="short_description" className="text-foreground">
          Short Description
        </Label>
        <Input
          id="short_description"
          value={formData.short_description}
          onChange={(e) => updateField("short_description", e.target.value)}
          placeholder="A brief tagline for your event"
          className="mt-1.5 bg-background border-border"
          maxLength={280}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {formData.short_description.length}/280
        </p>
      </div>

      <div>
        <Label htmlFor="description" className="text-foreground">
          Full Description{" "}
          <span className="text-[var(--color-accent)]">*</span>
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Describe your event in detail. What can attendees expect? What makes it special?"
          className="mt-1.5 bg-background border-border min-h-[160px]"
          maxLength={5000}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-[var(--color-danger)]">
            {errors.description}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {formData.description.length}/5000
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-foreground">
            Event Type <span className="text-[var(--color-accent)]">*</span>
          </Label>
          <Select
            value={formData.event_type}
            onValueChange={(v) => updateField("event_type", v)}
          >
            <SelectTrigger className="mt-1.5 bg-background border-border">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.event_type && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {errors.event_type}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="theme" className="text-foreground">
            Theme
          </Label>
          <Input
            id="theme"
            value={formData.theme}
            onChange={(e) => updateField("theme", e.target.value)}
            placeholder="e.g., Masquerade, Neon, Fetish"
            className="mt-1.5 bg-background border-border"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="cover_image_url" className="text-foreground">
          Cover Image URL
        </Label>
        <Input
          id="cover_image_url"
          type="url"
          value={formData.cover_image_url}
          onChange={(e) => updateField("cover_image_url", e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="mt-1.5 bg-background border-border"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="starts_at" className="text-foreground">
            Start Date & Time{" "}
            <span className="text-[var(--color-accent)]">*</span>
          </Label>
          <Input
            id="starts_at"
            type="datetime-local"
            value={formData.starts_at}
            onChange={(e) => updateField("starts_at", e.target.value)}
            className="mt-1.5 bg-background border-border"
          />
          {errors.starts_at && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {errors.starts_at}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="ends_at" className="text-foreground">
            End Date & Time{" "}
            <span className="text-[var(--color-accent)]">*</span>
          </Label>
          <Input
            id="ends_at"
            type="datetime-local"
            value={formData.ends_at}
            onChange={(e) => updateField("ends_at", e.target.value)}
            className="mt-1.5 bg-background border-border"
          />
          {errors.ends_at && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {errors.ends_at}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="timezone" className="text-foreground">
          Timezone
        </Label>
        <Input
          id="timezone"
          value={formData.timezone}
          onChange={(e) => updateField("timezone", e.target.value)}
          placeholder="America/Toronto"
          className="mt-1.5 bg-background border-border"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Auto-detected from your browser. Change if needed.
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const needsVenue =
      formData.format === "in_person" || formData.format === "hybrid";
    const needsVirtual =
      formData.format === "virtual" || formData.format === "hybrid";

    return (
      <div className="space-y-5">
        <div>
          <Label className="text-foreground">
            Format <span className="text-[var(--color-accent)]">*</span>
          </Label>
          <Select
            value={formData.format}
            onValueChange={(v) => updateField("format", v)}
          >
            <SelectTrigger className="mt-1.5 bg-background border-border">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {FORMAT_OPTIONS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.format && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {errors.format}
            </p>
          )}
        </div>

        {needsVenue && (
          <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MapPin weight="light" className="h-4 w-4 text-[var(--color-accent)]" />
              Venue Details
            </h3>

            <div>
              <Label htmlFor="venue_name" className="text-foreground">
                Venue Name
              </Label>
              <Input
                id="venue_name"
                value={formData.venue_name}
                onChange={(e) => updateField("venue_name", e.target.value)}
                placeholder="e.g., The Red Room"
                className="mt-1.5 bg-background border-border"
              />
            </div>

            <div>
              <Label htmlFor="venue_address" className="text-foreground">
                Address
              </Label>
              <Input
                id="venue_address"
                value={formData.venue_address}
                onChange={(e) => updateField("venue_address", e.target.value)}
                placeholder="Street address"
                className="mt-1.5 bg-background border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="venue_city" className="text-foreground">
                  City <span className="text-[var(--color-accent)]">*</span>
                </Label>
                <Input
                  id="venue_city"
                  value={formData.venue_city}
                  onChange={(e) => updateField("venue_city", e.target.value)}
                  placeholder="City"
                  className="mt-1.5 bg-background border-border"
                />
                {errors.venue_city && (
                  <p className="mt-1 text-xs text-[var(--color-danger)]">
                    {errors.venue_city}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="venue_province" className="text-foreground">
                  Province
                </Label>
                <Input
                  id="venue_province"
                  value={formData.venue_province}
                  onChange={(e) =>
                    updateField("venue_province", e.target.value)
                  }
                  placeholder="Province"
                  className="mt-1.5 bg-background border-border"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="venue_instructions" className="text-foreground">
                Arrival Instructions
              </Label>
              <Textarea
                id="venue_instructions"
                value={formData.venue_instructions}
                onChange={(e) =>
                  updateField("venue_instructions", e.target.value)
                }
                placeholder="Special entry instructions, parking info, etc."
                className="mt-1.5 bg-background border-border"
              />
            </div>
          </div>
        )}

        {needsVirtual && (
          <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Info weight="light" className="h-4 w-4 text-[var(--color-gold)]" />
              Virtual Details
            </h3>

            <div>
              <Label htmlFor="virtual_room_url" className="text-foreground">
                Room URL{" "}
                <span className="text-[var(--color-accent)]">*</span>
              </Label>
              <Input
                id="virtual_room_url"
                type="url"
                value={formData.virtual_room_url}
                onChange={(e) =>
                  updateField("virtual_room_url", e.target.value)
                }
                placeholder="https://zoom.us/..."
                className="mt-1.5 bg-background border-border"
              />
              {errors.virtual_room_url && (
                <p className="mt-1 text-xs text-[var(--color-danger)]">
                  {errors.virtual_room_url}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="virtual_platform" className="text-foreground">
                Platform
              </Label>
              <Input
                id="virtual_platform"
                value={formData.virtual_platform}
                onChange={(e) =>
                  updateField("virtual_platform", e.target.value)
                }
                placeholder="e.g., Zoom, Google Meet, Discord"
                className="mt-1.5 bg-background border-border"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-6">
      <ListEditor
        items={formData.rules}
        onAdd={(item) => updateField("rules", [...formData.rules, item])}
        onRemove={(idx) =>
          updateField(
            "rules",
            formData.rules.filter((_, i) => i !== idx)
          )
        }
        placeholder="Add a rule..."
        label="Event Rules"
      />

      <Separator className="bg-border" />

      <ListEditor
        items={formData.consent_requirements}
        onAdd={(item) =>
          updateField("consent_requirements", [
            ...formData.consent_requirements,
            item,
          ])
        }
        onRemove={(idx) =>
          updateField(
            "consent_requirements",
            formData.consent_requirements.filter((_, i) => i !== idx)
          )
        }
        placeholder="Add a consent requirement..."
        label="Consent Requirements"
      />

      <Separator className="bg-border" />

      <div>
        <Label htmlFor="dress_code" className="text-foreground">
          Dress Code
        </Label>
        <Input
          id="dress_code"
          value={formData.dress_code}
          onChange={(e) => updateField("dress_code", e.target.value)}
          placeholder="e.g., Formal, Fetish, Casual"
          className="mt-1.5 bg-background border-border"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="capacity" className="text-foreground">
            Capacity
          </Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={(e) => updateField("capacity", e.target.value)}
            placeholder="No limit"
            className="mt-1.5 bg-background border-border"
          />
        </div>

        <div>
          <Label htmlFor="ticket_price" className="text-foreground">
            Ticket Price (cents)
          </Label>
          <Input
            id="ticket_price"
            type="number"
            min="0"
            value={formData.ticket_price_cents}
            onChange={(e) => updateField("ticket_price_cents", e.target.value)}
            placeholder="0 = Free"
            className="mt-1.5 bg-background border-border"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Enter in cents (e.g., 2500 = $25.00). 0 for free.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-surface p-4 border border-border">
          <div>
            <Label className="text-foreground">BYOB</Label>
            <p className="text-xs text-muted-foreground">
              Attendees can bring their own beverages
            </p>
          </div>
          <Switch
            checked={formData.byob}
            onCheckedChange={(v) => updateField("byob", v)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg bg-surface p-4 border border-border">
          <div>
            <Label className="text-foreground">Catering Included</Label>
            <p className="text-xs text-muted-foreground">
              Food will be provided at the event
            </p>
          </div>
          <Switch
            checked={formData.catering_included}
            onCheckedChange={(v) => updateField("catering_included", v)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg bg-surface p-4 border border-border">
          <div>
            <Label className="text-foreground">
              Require ID Verification
            </Label>
            <p className="text-xs text-muted-foreground">
              Attendees must have a verified profile
            </p>
          </div>
          <Switch
            checked={formData.requires_verification}
            onCheckedChange={(v) => updateField("requires_verification", v)}
          />
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => {
    const eventTypeLabel =
      EVENT_TYPES.find((t) => t.value === formData.event_type)?.label ||
      formData.event_type;
    const formatLabel =
      FORMAT_OPTIONS.find((f) => f.value === formData.format)?.label ||
      formData.format;

    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-[var(--color-accent)]/20 bg-[var(--color-accent-muted)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info weight="light" className="h-4 w-4 text-[var(--color-accent)]" />
            <p className="text-sm font-medium text-foreground">
              Review your event
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Your event will be saved as a draft. You can publish it later from
            your events dashboard.
          </p>
        </div>

        <Card className="bg-surface border-border">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-xl">{formData.title}</CardTitle>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge className="bg-[var(--color-accent)] text-white border-0">
                {eventTypeLabel}
              </Badge>
              <Badge variant="outline" className="border-border">
                {formatLabel}
              </Badge>
              {formData.theme && (
                <Badge variant="secondary">{formData.theme}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.short_description && (
              <p className="text-sm text-muted-foreground">
                {formData.short_description}
              </p>
            )}

            <Separator className="bg-border" />

            {/* Schedule */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Schedule
              </p>
              {formData.starts_at && (
                <p className="text-sm text-foreground">
                  {format(new Date(formData.starts_at), "EEEE, MMMM d, yyyy")}
                </p>
              )}
              {formData.starts_at && formData.ends_at && (
                <p className="text-sm text-muted-foreground">
                  {format(new Date(formData.starts_at), "h:mm a")} &ndash;{" "}
                  {format(new Date(formData.ends_at), "h:mm a")}{" "}
                  ({formData.timezone})
                </p>
              )}
            </div>

            {/* Location */}
            {(formData.format === "in_person" ||
              formData.format === "hybrid") && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Venue
                </p>
                <p className="text-sm text-foreground">
                  {formData.venue_name || "TBA"} &middot;{" "}
                  {[formData.venue_city, formData.venue_province]
                    .filter(Boolean)
                    .join(", ") || "TBA"}
                </p>
              </div>
            )}

            {/* Virtual */}
            {(formData.format === "virtual" ||
              formData.format === "hybrid") && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Virtual
                </p>
                <p className="text-sm text-foreground">
                  {formData.virtual_platform || "Online"} &middot;{" "}
                  {formData.virtual_room_url || "URL not set"}
                </p>
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Capacity:</span>{" "}
                <span className="text-foreground">
                  {formData.capacity || "Unlimited"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Price:</span>{" "}
                <span className="text-foreground">
                  {Number(formData.ticket_price_cents) === 0
                    ? "Free"
                    : `$${(Number(formData.ticket_price_cents) / 100).toFixed(2)}`}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">BYOB:</span>{" "}
                <span className="text-foreground">
                  {formData.byob ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Catering:</span>{" "}
                <span className="text-foreground">
                  {formData.catering_included ? "Yes" : "No"}
                </span>
              </div>
            </div>

            {/* Rules */}
            {formData.rules.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Rules ({formData.rules.length})
                </p>
                <ul className="space-y-1">
                  {formData.rules.map((rule, idx) => (
                    <li key={idx} className="text-sm text-foreground flex gap-2">
                      <span className="text-muted-foreground">{idx + 1}.</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Consent */}
            {formData.consent_requirements.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Consent Requirements (
                  {formData.consent_requirements.length})
                </p>
                <ul className="space-y-1">
                  {formData.consent_requirements.map((req, idx) => (
                    <li key={idx} className="text-sm text-foreground flex gap-2">
                      <Check weight="bold" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-gold)]" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];

  return (
    <div className="mx-auto max-w-2xl">
      <StepIndicator currentStep={step} totalSteps={5} />

      <Card className="bg-surface border-border">
        <CardContent className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {stepRenderers[step - 1]()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1}
              className="text-muted-foreground"
            >
              <ArrowLeft weight="bold" className="mr-1 h-4 w-4" />
              Back
            </Button>

            {step < 5 ? (
              <Button
                onClick={nextStep}
                className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
              >
                Next
                <ArrowRight weight="bold" className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-[0_0_20px_rgba(194,24,91,0.2)]"
              >
                {submitting ? (
                  <>
                    <CircleNotch className="mr-1 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check weight="bold" className="mr-1 h-4 w-4" />
                    Create Event
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
