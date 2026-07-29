import { ImageResponse } from "next/og";
import { iconMark } from "@/lib/pwa-icon";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS aplica o próprio recorte arredondado — manda a arte sem cantos.
export default function AppleIcon() {
  return new ImageResponse(iconMark(180, 0), { ...size });
}
