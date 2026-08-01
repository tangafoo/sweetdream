import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "sweetdream — Mattresses made for deep sleep";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  // satori can't rasterize webp, so this route keeps its own PNG of the
  // star mark colocated in src/app rather than pulling from the R2 bucket.
  const icon = await readFile(join(process.cwd(), "src/app/sd-star-icon.png"));

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${icon.toString("base64")}`}
          width={96}
          height={95}
          alt=""
        />
        <div style={{ fontSize: 92, marginTop: 24, letterSpacing: -2 }}>SweetDream</div>
        <div style={{ fontSize: 30, marginTop: 12, color: "#6f665c" }}>
          Mattresses made for deep sleep
        </div>
      </div>
    ),
    size,
  );
}
