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
    default: "Paixão — Pure passion.",
    template: "%s | Paixão",
  },
  description:
    "An exclusive, anonymous, consent-first adult platform. Where desire meets discretion.",
  keywords: [
    "paixão",
    "adult platform",
    "consent",
    "anonymous",
    "exclusive",
    "events",
  ],
  authors: [{ name: "Paixão" }],
  creator: "Paixão",
  metadataBase: new URL("https://paixao.club"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Paixão",
    title: "Paixão — Pure passion.",
    description:
      "An exclusive, anonymous, consent-first adult platform. Where desire meets discretion.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Paixão — Pure passion.",
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
