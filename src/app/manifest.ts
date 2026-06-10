import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

// PWA manifest (Next 16 metadata route). Served at /manifest.webmanifest.
// Paixão launches web-first as an installable PWA — no app stores.
//
// REQUIRED ICONS (add these PNGs to /public — see README "PWA icons"):
//   /icon-192.png       192x192  (any)
//   /icon-512.png       512x512  (any)
//   /icon-maskable-512.png  512x512  (maskable, safe-zone padded)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    // Palette: black background, amber theme accent.
    background_color: "#0a0a0a",
    theme_color: "#d4a574",
    categories: ["lifestyle", "social"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
