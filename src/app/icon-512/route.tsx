import { ImageResponse } from "next/og";
import { iconMark } from "@/lib/pwa-icon";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(iconMark(512), { width: 512, height: 512 });
}
