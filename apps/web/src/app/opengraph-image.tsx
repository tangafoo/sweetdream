import { ImageResponse } from "next/og";

export const alt = "sweetdream — Mattresses made for deep sleep";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          background: "#faf7f2",
          color: "#1c1713",
          fontFamily: "Georgia, serif",
        }}
      >
        <svg width="72" height="72" viewBox="0 0 32 32">
          <path d="M21.5 4.5a12 12 0 1 0 6 16.5A10 10 0 1 1 21.5 4.5Z" fill="#1c1713" />
        </svg>
        <div style={{ fontSize: 92, marginTop: 24, letterSpacing: -2 }}>sweetdream</div>
        <div style={{ fontSize: 30, marginTop: 12, color: "#6f665c" }}>
          Mattresses made for deep sleep
        </div>
      </div>
    ),
    size,
  );
}
