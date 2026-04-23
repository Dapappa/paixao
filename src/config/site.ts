export const siteConfig = {
  name: "PassionDen",
  nameStylized: "PASSIONDEN",
  tagline: "Step inside.",
  description:
    "An exclusive, anonymous, consent-first adult platform. Where desire meets discretion.",
  url: "https://passionden.club",
  links: {
    twitter: "https://x.com/passionden",
    instagram: "https://instagram.com/passionden",
  },
  support: {
    email: "support@passionden.club",
  },
  legal: {
    minimumAge: 18,
    privacyPolicy: "/legal/privacy",
    termsOfService: "/legal/terms",
    communityGuidelines: "/legal/guidelines",
  },
} as const;

export type SiteConfig = typeof siteConfig;
