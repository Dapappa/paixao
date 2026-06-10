import "server-only";

/**
 * SHORTAPI client — the asset/AI generation backbone for Paixão.
 *
 * SHORTAPI (https://shortapi.ai) is a unified gateway over the best 2026 image,
 * video, music and LLM models (Nano Banana Pro, Seedream 5, Flux, Veo 3.1,
 * Kling 3.0, Sora 2, Claude, GPT, …). It uses an ASYNCHRONOUS job queue:
 *
 *   POST /api/v1/job/create   { model, args, callback_url? }   -> { job_id }
 *   GET  /api/v1/job/query?id=<job_id>                          -> { status, result, ... }
 *
 * Server-only by design: the key never reaches the client, and generation is
 * run once at asset-prep time (or via a queued route), never on a user request.
 * Kept behind a thin provider interface so fal.ai / Replicate can swap in.
 */

const BASE_URL = process.env.SHORTAPI_BASE_URL ?? "https://api.shortapi.ai";

function key(): string {
  const k = process.env.SHORTAPI_KEY;
  if (!k) throw new Error("SHORTAPI_KEY is not set in the environment.");
  return k;
}

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${key()}`,
    "Content-Type": "application/json",
  };
}

/* ------------------------------------------------------------------ */
/* Model identifiers (from shortapi.ai/models). Centralised so call    */
/* sites stay readable and a model bump is a one-line change.          */
/* ------------------------------------------------------------------ */

export const MODELS = {
  image: {
    nanoBananaPro: "google/nano-banana-pro/text-to-image",
    nanoBananaProEdit: "google/nano-banana-pro/edit",
    seedream5: "bytedance/seedream-5.0/text-to-image",
    flux1: "shortapi/flux-1.0/text-to-image",
    gptImage2: "openai/gpt-image-2/text-to-image",
    midjourney7: "midjourney/midjourney-v7/text-to-image",
  },
  video: {
    veo31FromImage: "google/veo-3.1/image-to-video",
    veo31FromText: "google/veo-3.1/text-to-video",
    kling3FromImage: "kwaivgi/kling-3.0/image-to-video",
    seedance2FromImage: "bytedance/seedance-2.0/image-to-video",
  },
} as const;

/* ------------------------------------------------------------------ */
/* Core job lifecycle                                                  */
/* ------------------------------------------------------------------ */

/** SHORTAPI uses numeric status (2 = success); strings kept for forward-compat. */
export type JobStatus = number | "pending" | "queued" | "processing" | "succeeded" | "completed" | "failed" | "error" | string;

export interface JobRecord {
  job_id?: string;
  id?: string;
  status?: JobStatus;
  result?: unknown;
  output?: unknown;
  error?: unknown;
  refunded?: boolean;
  credit?: string;
  [k: string]: unknown;
}

/** Submit a generation job; returns the job id. */
export async function createJob(model: string, args: Record<string, unknown>, callbackUrl?: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/v1/job/create`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ model, args, ...(callbackUrl ? { callback_url: callbackUrl } : {}) }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`SHORTAPI create ${res.status}: ${text.slice(0, 500)}`);
  // Envelope: { code: 0, data: { job_id, amount } }
  const env = safeJson<{ code?: number; data?: JobRecord }>(text);
  if (env?.code != null && env.code !== 0) throw new Error(`SHORTAPI create error code ${env.code}: ${text.slice(0, 500)}`);
  const id = env?.data?.job_id ?? env?.data?.id;
  if (!id) throw new Error(`SHORTAPI create: no job_id in response: ${text.slice(0, 500)}`);
  return id;
}

/** Fetch the current state of a job. */
export async function queryJob(id: string): Promise<JobRecord> {
  const res = await fetch(`${BASE_URL}/api/v1/job/query?id=${encodeURIComponent(id)}`, {
    method: "GET",
    headers: headers(),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`SHORTAPI query ${res.status}: ${text.slice(0, 500)}`);
  // Envelope: { code: 0, data: { id, status, result, refunded, ... } }
  const env = safeJson<{ code?: number; data?: JobRecord }>(text);
  return env?.data ?? safeJson<JobRecord>(text) ?? {};
}

// Status is NUMERIC on SHORTAPI: 2 = finished/success. A failed job is also
// flagged with `refunded: true`. String aliases kept for forward-compat.
const DONE = new Set(["succeeded", "completed", "success", "done", "finished"]);
const FAILED = new Set(["failed", "error", "cancelled", "canceled"]);

function isDone(rec: JobRecord): boolean {
  if (rec.status === 2) return true;
  return DONE.has(String(rec.status ?? "").toLowerCase());
}
function isFailed(rec: JobRecord): boolean {
  if (rec.refunded === true) return true;
  if (typeof rec.status === "number") return rec.status >= 3;
  return FAILED.has(String(rec.status ?? "").toLowerCase());
}

export interface PollOptions {
  /** total time to wait before giving up (ms). Default 5 min. */
  timeoutMs?: number;
  /** delay between polls (ms). Default 4s. */
  intervalMs?: number;
  /** called on each poll with the latest record (for logging). */
  onTick?: (rec: JobRecord) => void;
}

/** Create a job and poll until it finishes, returning the final record. */
export async function runJob(
  model: string,
  args: Record<string, unknown>,
  opts: PollOptions = {},
): Promise<JobRecord> {
  const { timeoutMs = 300_000, intervalMs = 4_000, onTick } = opts;
  const id = await createJob(model, args);
  const deadline = Date.now() + timeoutMs;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const rec = await queryJob(id);
    onTick?.(rec);
    if (isDone(rec)) return rec;
    if (isFailed(rec)) throw new Error(`SHORTAPI job ${id} failed: ${JSON.stringify(rec.error ?? rec.result ?? rec)}`);
    if (Date.now() > deadline) throw new Error(`SHORTAPI job ${id} timed out after ${timeoutMs}ms (last status: ${rec.status ?? "unknown"})`);
    await sleep(intervalMs);
  }
}

/**
 * Pull asset URL(s) out of a finished job record. The exact result shape is
 * confirmed by the in-flight model-intel research; this scans the common
 * locations defensively (result.url, result.images[], output[], data[], …).
 */
export function extractUrls(rec: JobRecord): string[] {
  const out: string[] = [];
  const visit = (v: unknown) => {
    if (!v) return;
    if (typeof v === "string") {
      if (/^https?:\/\/\S+\.(png|jpe?g|webp|avif|mp4|webm|mov|gif)/i.test(v) || /^https?:\/\//.test(v)) out.push(v);
      return;
    }
    if (Array.isArray(v)) return v.forEach(visit);
    if (typeof v === "object") {
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        if (/^(url|image_url|video_url|signed_url|download_url|uri)$/i.test(k) && typeof val === "string") out.push(val);
        else visit(val);
      }
    }
  };
  visit(rec.result ?? rec.output ?? rec);
  return Array.from(new Set(out));
}

/* ------------------------------------------------------------------ */
/* High-level helpers (args refined once model-intel lands)            */
/* ------------------------------------------------------------------ */

export interface ImageOptions {
  model?: string;
  aspectRatio?: string;
  seed?: number;
  negativePrompt?: string;
  extra?: Record<string, unknown>;
}

export async function generateImage(prompt: string, opts: ImageOptions = {}): Promise<string[]> {
  const { model = MODELS.image.nanoBananaPro, aspectRatio, seed, negativePrompt, extra } = opts;
  const args: Record<string, unknown> = { prompt, ...extra };
  if (aspectRatio) args.aspect_ratio = aspectRatio;
  if (seed != null) args.seed = seed;
  if (negativePrompt) args.negative_prompt = negativePrompt;
  const rec = await runJob(model, args);
  return extractUrls(rec);
}

export interface VideoFromImageOptions {
  model?: string;
  durationSeconds?: number;
  aspectRatio?: string;
  extra?: Record<string, unknown>;
}

export async function generateVideoFromImage(
  imageUrl: string,
  prompt: string,
  opts: VideoFromImageOptions = {},
): Promise<string[]> {
  const { model = MODELS.video.veo31FromImage, durationSeconds, aspectRatio, extra } = opts;
  const args: Record<string, unknown> = { prompt, image_url: imageUrl, ...extra };
  if (durationSeconds) args.duration = durationSeconds;
  if (aspectRatio) args.aspect_ratio = aspectRatio;
  const rec = await runJob(model, args, { timeoutMs: 600_000, intervalMs: 6_000 });
  return extractUrls(rec);
}

/* ------------------------------------------------------------------ */

function safeJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
