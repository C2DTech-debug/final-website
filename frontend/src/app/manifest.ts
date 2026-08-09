import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "C2D Tech (Concept to Deploy)",
    short_name: "C2D Tech",
    description:
      "C2D Tech (Concept to Deploy) — premium websites, mobile apps, AI automation, cloud & DevOps solutions.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7c3aed",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
