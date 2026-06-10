import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

// Branded social-share image for the home route. Renders when paixao.club is
// shared on X, Instagram, iMessage, Slack, etc. during the founding campaign.
export const alt = `${siteConfig.name} — ${siteConfig.welcome}`;
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
        {/* Ambient amber glow top */}
        <div
          style={{
            position: "absolute",
            top: -260,
            left: 300,
            width: 600,
            height: 600,
            borderRadius: "9999px",
            background: AMBER,
            opacity: 0.16,
            filter: "blur(140px)",
            display: "flex",
          }}
        />
        {/* Ambient crimson glow bottom */}
        <div
          style={{
            position: "absolute",
            bottom: -240,
            right: 220,
            width: 520,
            height: 520,
            borderRadius: "9999px",
            background: CRIMSON,
            opacity: 0.18,
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

        {/* Kicker */}
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 14,
            textTransform: "uppercase",
            color: "#a7a7a7",
            marginBottom: 24,
            fontFamily: "sans-serif",
          }}
        >
          {siteConfig.welcome}
        </div>

        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: 188,
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

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 38,
            fontStyle: "italic",
            color: AMBER,
          }}
        >
          {siteConfig.tagline}
        </div>

        {/* Footer mark */}
        <div
          style={{
            position: "absolute",
            bottom: 70,
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            color: "#8a8a8a",
            fontFamily: "sans-serif",
          }}
        >
          <span style={{ display: "flex", color: CRIMSON }}>●</span>
          <span style={{ display: "flex" }}>18+ · By invitation</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
