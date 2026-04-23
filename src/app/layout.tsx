import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PassionDen — Step inside.",
    template: "%s | PassionDen",
  },
  description:
    "An exclusive, anonymous, consent-first adult platform. Where desire meets discretion.",
  keywords: [
    "passionden",
    "adult platform",
    "consent",
    "anonymous",
    "exclusive",
    "events",
  ],
  authors: [{ name: "PassionDen" }],
  creator: "PassionDen",
  metadataBase: new URL("https://passionden.club"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "PassionDen",
    title: "PassionDen — Step inside.",
    description:
      "An exclusive, anonymous, consent-first adult platform. Where desire meets discretion.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PassionDen — Step inside.",
    description:
      "An exclusive, anonymous, consent-first adult platform. Where desire meets discretion.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
