export const siteConfig = {
  name: "Paixão",
  nameStylized: "PAIXÃO",
  welcome: "Welcome to the Passion Den",
  tagline: "Pure passion.",
  description:
    "An exclusive, anonymous, consent-first adult platform. Where desire meets discretion.",
  url: "https://paixao.club",
  links: {
    twitter: "https://x.com/paixao",
    instagram: "https://instagram.com/paixao",
  },
  support: {
    email: "support@paixao.club",
  },
  legal: {
    minimumAge: 18,
    privacyPolicy: "/legal/privacy",
    termsOfService: "/legal/terms",
    communityGuidelines: "/legal/guidelines",
  },
} as const;

export type SiteConfig = typeof siteConfig;
