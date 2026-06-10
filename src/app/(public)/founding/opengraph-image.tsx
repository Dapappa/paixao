import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

// Branded social-share image for the founding pre-sale funnel. This is the
// image that unfurls when the campaign link (/founding) is shared.
export const alt = `${siteConfig.name} — Founding Membership`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand palette
const BLACK = "#0a0a0a";
const AMBER = "#d4a574";
const CRIMSON = "#c2185b";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: BLACK,
          position: "relative",
          fontFamily: "serif",
        }}
      >
        {/* Ambient crimson glow */}
        <div
          style={{
            position: "absolute",
            top: -220,
            right: 260,
            width: 560,
            height: 560,
            borderRadius: "9999px",
            background: CRIMSON,
            opacity: 0.2,
            filter: "blur(150px)",
            display: "flex",
          }}
        />
        {/* Ambient amber glow */}
        <div
          style={{
            position: "absolute",
            bottom: -260,
            left: 240,
            width: 560,
            height: 560,
            borderRadius: "9999px",
            background: AMBER,
            opacity: 0.16,
            filter: "blur(150px)",
            display: "flex",
          }}
        />

        {/* Hairline frame */}
        <div
          style={{
            position: "absolute",
            inset: 36,
            border: `1px solid ${AMBER}`,
            opacity: 0.28,
            borderRadius: 14,
            display: "flex",
          }}
        />

        {/* Pill badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 26px",
            borderRadius: 9999,
            border: `1px solid ${AMBER}`,
            color: AMBER,
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 34,
            fontFamily: "sans-serif",
          }}
        >
          <span style={{ display: "flex", color: CRIMSON }}>●</span>
          Founding Membership
        </div>

        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: 150,
            fontWeight: 700,
            letterSpacing: 4,
            lineHeight: 1,
            color: "#fafafa",
          }}
        >
          <span>PAIX</span>
          <span style={{ color: AMBER }}>Ã</span>
          <span>O</span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            marginTop: 30,
            fontSize: 40,
            color: "#e6e6e6",
            textAlign: "center",
          }}
        >
          {siteConfig.welcome}
        </div>

        {/* Subline */}
        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: 27,
            color: "#9a9a9a",
            fontFamily: "sans-serif",
          }}
        >
          Be one of the first 100. Lock in lifetime founding pricing.
        </div>
      </div>
    ),
    { ...size }
  );
}
