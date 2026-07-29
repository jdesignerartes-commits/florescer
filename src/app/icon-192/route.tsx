import { ImageResponse } from "next/og";
import { iconMark } from "@/lib/pwa-icon";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(iconMark(192), { width: 192, height: 192 });
}
