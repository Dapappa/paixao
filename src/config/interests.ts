export interface Interest {
  id: string;
  label: string;
  emoji?: string;
}

export interface InterestCategory {
  id: string;
  label: string;
  description: string;
  items: Interest[];
}

export const interestCategories: InterestCategory[] = [
  {
    id: "kink",
    label: "Kinks & Fetishes",
    description: "Specific desires and turn-ons",
    items: [
      { id: "bondage", label: "Bondage", emoji: "🪢" },
      { id: "dominance", label: "Dominance", emoji: "👑" },
      { id: "submission", label: "Submission", emoji: "🧎" },
      { id: "roleplay", label: "Roleplay", emoji: "🎭" },
      { id: "voyeurism", label: "Voyeurism", emoji: "👀" },
      { id: "exhibitionism", label: "Exhibitionism", emoji: "✨" },
      { id: "sensory-play", label: "Sensory Play", emoji: "🕯️" },
      { id: "impact-play", label: "Impact Play", emoji: "🖐️" },
      { id: "leather", label: "Leather", emoji: "🖤" },
      { id: "latex", label: "Latex", emoji: "💎" },
      { id: "lingerie", label: "Lingerie", emoji: "🩱" },
      { id: "feet", label: "Feet", emoji: "🦶" },
      { id: "edge-play", label: "Edge Play", emoji: "⚡" },
      { id: "pet-play", label: "Pet Play", emoji: "🐾" },
      { id: "rope-art", label: "Rope Art / Shibari", emoji: "🎨" },
      { id: "body-worship", label: "Body Worship", emoji: "💋" },
      { id: "orgasm-control", label: "Orgasm Control", emoji: "🔐" },
      { id: "chastity", label: "Chastity", emoji: "🔒" },
      { id: "electro-play", label: "Electro Play", emoji: "⚡" },
      { id: "wax-play", label: "Wax Play", emoji: "🕯️" },
    ],
  },
  {
    id: "activity",
    label: "Activities",
    description: "What you enjoy doing",
    items: [
      { id: "threesome", label: "Threesomes", emoji: "🔺" },
      { id: "group", label: "Group Play", emoji: "👥" },
      { id: "swinging", label: "Swinging", emoji: "🔄" },
      { id: "soft-swap", label: "Soft Swap", emoji: "💫" },
      { id: "full-swap", label: "Full Swap", emoji: "🔀" },
      { id: "cuckolding", label: "Cuckolding", emoji: "🃏" },
      { id: "hotwifing", label: "Hotwifing", emoji: "🔥" },
      { id: "tantra", label: "Tantra", emoji: "🧘" },
      { id: "massage", label: "Erotic Massage", emoji: "💆" },
      { id: "oral", label: "Oral Focus", emoji: "👄" },
      { id: "anal", label: "Anal Play", emoji: "🍑" },
      { id: "toys", label: "Toy Play", emoji: "🎲" },
      { id: "edging", label: "Edging", emoji: "🌊" },
      { id: "mutual-masturbation", label: "Mutual Masturbation", emoji: "🤝" },
      { id: "double-penetration", label: "Double Penetration", emoji: "💠" },
      { id: "gangbang", label: "Gangbang", emoji: "⭐" },
      { id: "orgy", label: "Orgies", emoji: "🎉" },
      { id: "glory-hole", label: "Glory Hole", emoji: "⬛" },
    ],
  },
  {
    id: "social",
    label: "Social & Connection",
    description: "How you like to connect",
    items: [
      { id: "dating", label: "Dating", emoji: "🌹" },
      { id: "fwb", label: "Friends with Benefits", emoji: "😏" },
      { id: "casual-hookup", label: "Casual Hookups", emoji: "🔥" },
      { id: "one-night", label: "One-Night Stands", emoji: "🌙" },
      { id: "long-term", label: "Long-Term Dynamic", emoji: "💞" },
      { id: "online-only", label: "Online Only", emoji: "💻" },
      { id: "mentoring", label: "Mentoring / Teaching", emoji: "📚" },
      { id: "play-parties", label: "Play Parties", emoji: "🎊" },
      { id: "munches", label: "Munches", emoji: "🍽️" },
      { id: "workshops", label: "Workshops", emoji: "🛠️" },
      { id: "clubs", label: "Club Nights", emoji: "🌃" },
      { id: "private-events", label: "Private Events", emoji: "🏠" },
      { id: "travel-partner", label: "Travel Partner", emoji: "✈️" },
      { id: "networking", label: "Networking", emoji: "🤝" },
    ],
  },
  {
    id: "lifestyle",
    label: "Lifestyle & Identity",
    description: "How you identify and live",
    items: [
      { id: "polyamorous", label: "Polyamorous", emoji: "💜" },
      { id: "open-relationship", label: "Open Relationship", emoji: "🔓" },
      { id: "monogamish", label: "Monogam-ish", emoji: "💛" },
      { id: "ethically-non-monogamous", label: "ENM", emoji: "🌈" },
      { id: "dom-lifestyle", label: "Dominant Lifestyle", emoji: "👑" },
      { id: "sub-lifestyle", label: "Submissive Lifestyle", emoji: "🧎" },
      { id: "switch", label: "Switch", emoji: "🔄" },
      { id: "vanilla-friendly", label: "Vanilla-Friendly", emoji: "🍦" },
      { id: "kink-curious", label: "Kink-Curious", emoji: "❓" },
      { id: "experienced", label: "Experienced", emoji: "⭐" },
      { id: "nudist", label: "Nudist / Naturist", emoji: "☀️" },
      { id: "sapiosexual", label: "Sapiosexual", emoji: "🧠" },
      { id: "demisexual", label: "Demisexual", emoji: "🤍" },
      { id: "sex-positive", label: "Sex-Positive", emoji: "✅" },
      { id: "body-positive", label: "Body-Positive", emoji: "💪" },
      { id: "420-friendly", label: "420-Friendly", emoji: "🌿" },
    ],
  },
];

/**
 * Flatten all interests into a single list.
 */
export function getAllInterests(): Interest[] {
  return interestCategories.flatMap((category) => category.items);
}

/**
 * Find an interest by ID across all categories.
 */
export function findInterestById(id: string): Interest | undefined {
  return getAllInterests().find((interest) => interest.id === id);
}

/**
 * Find the category an interest belongs to.
 */
export function findCategoryByInterestId(
  id: string
): InterestCategory | undefined {
  return interestCategories.find((category) =>
    category.items.some((item) => item.id === id)
  );
}
