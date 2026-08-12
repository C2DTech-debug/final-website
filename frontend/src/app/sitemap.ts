import type { MetadataRoute } from "next";
import type { Blog, Job } from "@/types";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.c2dtech.com";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATIC_ROUTES = [
  "",
  "/services",
  "/portfolio",
  "/blogs",
  "/careers",
  "/sitemap",
  "/about",
  "/team",
  "/contact",
  "/estimator",
  "/privacy",
  "/terms",
  "/cookies",
];

async function fetchJson<T>(path: string): Promise<{ data: T; meta?: Record<string, unknown> } | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return (await res.json()) as { data: T; meta?: Record<string, unknown> };
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  const [blogs, jobs] = await Promise.all([
    fetchJson<Blog[]>("/api/v1/public/blogs?limit=50"),
    fetchJson<Job[]>("/api/v1/public/careers"),
  ]);

  const blogUrls: MetadataRoute.Sitemap = (blogs?.data ?? []).map((b) => ({
    url: `${BASE}/blogs/${b.slug}`,
    lastModified: b.publishedAt ? new Date(b.publishedAt) : new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const jobUrls: MetadataRoute.Sitemap = (jobs?.data ?? []).map((j) => ({
    url: `${BASE}/careers/${j.slug}`,
    lastModified: j.updatedAt ? new Date(j.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticUrls, ...blogUrls, ...jobUrls];
}
