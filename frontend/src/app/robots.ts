import type { MetadataRoute } from "next";

function resolvePublicBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!envUrl || envUrl.includes("onrender.com") || envUrl.includes("localhost") || !envUrl.includes("c2dtech.com")) {
    return "https://www.c2dtech.com";
  }
  return envUrl.replace(/\/$/, "");
}

const BASE = resolvePublicBase();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
