// The preview card shown when a MedTrack link is pasted into Slack, Teams or
// email. Next generates the PNG and adds the og:image tags automatically.

import { ImageResponse } from "next/og";

export const alt = "MedTrack — clinic console";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #00508a, #002a4b)",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 20,
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="52" height="52" viewBox="0 0 24 24" fill="#004a80">
            <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" />
          </svg>
        </div>
        <div style={{ fontSize: 84, fontWeight: 700, marginTop: 40 }}>MedTrack</div>
        <div style={{ fontSize: 36, opacity: 0.8, marginTop: 12 }}>
          Triage, records and appointments for the clinic day
        </div>
      </div>
    ),
    size,
  );
}
