import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/features/seo/seo";

// Default share picture for pages without their own image. It is drawn from
// the existing white logo; TSK-40 may later replace it with a dedicated image.
export const alt = SITE_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// «Patio de luz» tokens from src/app/globals.css.
const INK = "#15181c";
const BONE = "#ede7dc";
const BRASS = "#a9814c";

export default async function OpenGraphImage() {
  const [logo, serif] = await Promise.all([
    readFile(join(process.cwd(), "public/logo.png")),
    readFile(join(process.cwd(), "public/fonts/NotoSerif-Regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: INK }}>
        <img src={`data:image/png;base64,${logo.toString("base64")}`} width={738} height={198} alt="" />
        <div style={{ width: 96, height: 2, marginTop: 34, background: BRASS }} />
        <div style={{ marginTop: 30, fontFamily: "Noto Serif", fontSize: 34, color: BONE }}>{SITE_DESCRIPTION}</div>
      </div>
    ),
    { ...size, fonts: [{ name: "Noto Serif", data: serif, style: "normal", weight: 400 }] },
  );
}
