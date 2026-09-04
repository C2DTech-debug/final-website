import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "C2D Tech (Concept to Deploy)",
    short_name: "C2D Tech",
    description: "Websites, Mobile Apps & AI Automation",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#293681",
    icons: [
      { src: "/brand-logo.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  };
}
