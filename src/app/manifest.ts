import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Florescer",
    short_name: "Florescer",
    description: "Pequenas ações diárias constroem uma vida equilibrada.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F1E8",
    theme_color: "#B56E4A",
    orientation: "portrait",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
