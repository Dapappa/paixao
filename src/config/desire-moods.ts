/**
 * Maps each interest category to a Tier-1 (tasteful, M-rated) mood image + a
 * discreet-host line, so the desires picker reads as a cinematic, sensual
 * experience instead of an emoji grid. Images live in /public/generated and
 * are generated via Flux (see scripts/asset-jobs.json).
 *
 * NOTE: these are Tier-1 only (implied/boudoir, no nudity). Explicit content
 * belongs behind the NSFW gate, never inlined here.
 */
export interface DesireMood {
  image: string;
  line: string;
}

export const desireMoods: Record<string, DesireMood> = {
  kink: {
    image: "/generated/tier1-desire-restraint.webp",
    line: "What quickens you. Tell the truth — no judgment lives here, only curiosity.",
  },
  activity: {
    image: "/generated/tier1-couple.webp",
    line: "How you like to play — on your own, paired off, or in very good company.",
  },
  social: {
    image: "/generated/tier1-desire-romance.webp",
    line: "The shape of what you're after, from a single night to something that lingers.",
  },
  lifestyle: {
    image: "/generated/tier1-desire-sensual.webp",
    line: "Who you become once the door closes and the lights go low.",
  },
};

export const fallbackMood: DesireMood = desireMoods.kink;
