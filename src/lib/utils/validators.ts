import { z } from "zod";

/* ─────────────────────────────────────────────
   Event Types & Enums
   ───────────────────────────────────────────── */

export const eventTypeEnum = z.enum([
  "munch",
  "play_party",
  "workshop",
  "social",
  "dungeon",
  "retreat",
  "conference",
  "other",
]);

export const eventFormatEnum = z.enum(["in_person", "virtual", "hybrid"]);

export const eventStatusEnum = z.enum([
  "draft",
  "pending_review",
  "published",
  "cancelled",
  "archived",
  "completed",
]);

export const registrationStatusEnum = z.enum([
  "pending",
  "confirmed",
  "waitlisted",
  "cancelled",
  "checked_in",
  "no_show",
]);

export const paymentStatusEnum = z.enum([
  "not_required",
  "pending",
  "completed",
  "refunded",
  "failed",
]);

/* ─────────────────────────────────────────────
   Create Event Schema
   ───────────────────────────────────────────── */

export const createEventSchema = z.object({
  // Step 1 — Basic Info
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  short_description: z
    .string()
    .max(280, "Short description must be under 280 characters")
    .optional(),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000),
  event_type: eventTypeEnum,
  theme: z.string().max(100).optional(),
  cover_image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),

  // Step 2 — Schedule
  starts_at: z.string().min(1, "Start date is required"),
  ends_at: z.string().min(1, "End date is required"),
  timezone: z.string().min(1, "Timezone is required"),

  // Step 3 — Location / Virtual
  format: eventFormatEnum,
  venue_name: z.string().max(200).optional(),
  venue_address: z.string().max(500).optional(),
  venue_city: z.string().max(100).optional(),
  venue_province: z.string().max(100).optional(),
  venue_instructions: z.string().max(1000).optional(),
  virtual_room_url: z.string().url().optional().or(z.literal("")),
  virtual_platform: z.string().max(100).optional(),

  // Step 4 — Rules & Consent
  rules: z.array(z.string().min(1)).default([]),
  consent_requirements: z.array(z.string().min(1)).default([]),
  dress_code: z.string().max(500).optional(),
  byob: z.boolean().default(false),
  catering_included: z.boolean().default(false),
  capacity: z.number().int().min(1).max(10000).optional(),
  min_age: z.number().int().min(18).max(99).default(18),
  requires_verification: z.boolean().default(false),
  ticket_price_cents: z.number().int().min(0).default(0),
  currency: z.string().length(3).default("CAD"),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

/* ─────────────────────────────────────────────
   Update Event Schema
   ───────────────────────────────────────────── */

export const updateEventSchema = createEventSchema.partial().extend({
  status: eventStatusEnum.optional(),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

/* ─────────────────────────────────────────────
   Register for Event Schema
   ───────────────────────────────────────────── */

export const registerForEventSchema = z.object({
  consent_acknowledged: z.literal(true, {
    message: "You must acknowledge all consent requirements",
  }),
  notes: z.string().max(500).optional(),
});

export type RegisterForEventInput = z.infer<typeof registerForEventSchema>;

/* ─────────────────────────────────────────────
   Check-in Schema
   ───────────────────────────────────────────── */

export const checkInSchema = z.object({
  check_in_code: z.string().uuid("Invalid check-in code"),
});

export type CheckInInput = z.infer<typeof checkInSchema>;

/* ─────────────────────────────────────────────
   Match Action Schema
   ───────────────────────────────────────────── */

export const matchActionEnum = z.enum(["like", "pass", "super_like"]);

export const matchActionSchema = z.object({
  target_id: z.string().uuid("Invalid target profile ID"),
  action: matchActionEnum,
});

export type MatchActionInput = z.infer<typeof matchActionSchema>;

/* ─────────────────────────────────────────────
   Match Preferences Schema
   ───────────────────────────────────────────── */

export const matchPreferencesSchema = z.object({
  preferred_genders: z.array(z.string()).default([]),
  min_age: z.number().int().min(18).max(99).default(18),
  max_age: z.number().int().min(18).max(99).default(99),
  preferred_experience_levels: z.array(z.string()).default([]),
  max_distance_km: z.number().int().min(1).max(500).optional(),
  preferred_relationship_types: z.array(z.string()).default([]),
  deal_breakers: z.array(z.string()).default([]),
});

export type MatchPreferencesInput = z.infer<typeof matchPreferencesSchema>;

/* ─────────────────────────────────────────────
   Create Match Group Schema
   ───────────────────────────────────────────── */

export const createMatchGroupSchema = z.object({
  name: z.string().min(2, "Group name must be at least 2 characters").max(100),
  group_type: z.enum(["couple", "triad", "quad", "polycule", "other"]),
  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional(),
  is_visible: z.boolean().default(true),
});

export type CreateMatchGroupInput = z.infer<typeof createMatchGroupSchema>;

/* ─────────────────────────────────────────────
   Consent Record Schema
   ───────────────────────────────────────────── */

export const recordConsentSchema = z.object({
  consent_type: z.string().min(1),
  context_type: z.string().min(1),
  context_id: z.string().uuid(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export type RecordConsentInput = z.infer<typeof recordConsentSchema>;

/* ─────────────────────────────────────────────
   Query / Filter Schemas
   ───────────────────────────────────────────── */

export const eventFiltersSchema = z.object({
  event_type: eventTypeEnum.optional(),
  format: eventFormatEnum.optional(),
  city: z.string().optional(),
  search: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  page: z.number().int().min(1).default(1),
  per_page: z.number().int().min(1).max(50).default(12),
});

export type EventFilters = z.infer<typeof eventFiltersSchema>;

/* ─────────────────────────────────────────────
   Messaging Schemas
   ───────────────────────────────────────────── */

export const messageTypeEnum = z.enum([
  "text",
  "image",
  "video",
  "audio",
  "system",
  "consent_request",
  "safe_word",
]);

export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message must be under 5000 characters"),
  message_type: messageTypeEnum.default("text"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

/* ─────────────────────────────────────────────
   Safety & Moderation Schemas
   ───────────────────────────────────────────── */

export const reportCategoryEnum = z.enum([
  "harassment",
  "consent_violation",
  "underage_suspicion",
  "inappropriate_content",
  "spam",
  "impersonation",
  "unsafe_behavior",
  "discrimination",
  "other",
]);

export const reportSeverityEnum = z.enum(["low", "medium", "high", "critical"]);

export const reportSchema = z.object({
  category: reportCategoryEnum,
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be under 2000 characters"),
  evidence_urls: z.array(z.string().url("Must be a valid URL")).optional(),
  reported_user_id: z.string().uuid("Invalid user ID").optional(),
  reported_event_id: z.string().uuid("Invalid event ID").optional(),
  reported_message_id: z.string().uuid("Invalid message ID").optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;

export const blockSchema = z.object({
  blocked_id: z.string().uuid("Invalid user ID"),
  reason: z.string().max(500).optional(),
});

export type BlockInput = z.infer<typeof blockSchema>;

export const safeWordActionEnum = z.enum([
  "alert",
  "exit_event",
  "notify_emergency",
]);

export const safeWordSchema = z.object({
  safe_word: z
    .string()
    .min(1, "Safe word is required")
    .max(50, "Safe word must be under 50 characters"),
  action_on_trigger: safeWordActionEnum,
  emergency_contact_name: z.string().max(100).optional(),
  emergency_contact_method: z.enum(["email", "sms"]).optional(),
  emergency_contact_value: z.string().max(200).optional(),
});

export type SafeWordInput = z.infer<typeof safeWordSchema>;
