import type { Blog, HomeBundle, Job, PortfolioProject, SeoSetting, Service, TeamMember } from "@/types";

export interface PortfolioListResult {
  data: PortfolioProject[];
  categories: string[];
}

export interface BlogListResult {
  data: Blog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    categories?: string[];
  };
}

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as { data: T };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function getHomeBundle(): Promise<HomeBundle | null> {
  return fetchJson<HomeBundle>("/api/v1/public/home");
}

export async function getSeoForPage(page: string): Promise<SeoSetting | null> {
  return fetchJson<SeoSetting>(`/api/v1/public/seo/${page}`);
}

export async function getServices(): Promise<Service[] | null> {
  return fetchJson<Service[]>("/api/v1/public/services");
}

export async function getTeam(): Promise<TeamMember[] | null> {
  return fetchJson<TeamMember[]>("/api/v1/public/team");
}

export async function getPortfolio(): Promise<PortfolioListResult | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/public/portfolio`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: PortfolioProject[]; meta?: { categories?: string[] } };
    return {
      data: json.data ?? [],
      categories: json.meta?.categories ?? [],
    };
  } catch {
    return null;
  }
}

export async function getBlogs(params: { page?: number; category?: string } = {}): Promise<BlogListResult | null> {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.category && params.category !== "All") search.set("category", params.category);
  const query = search.toString();
  try {
    const res = await fetch(`${API_BASE}/api/v1/public/blogs${query ? `?${query}` : ""}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data: Blog[];
      meta?: { page: number; limit: number; total: number; pages: number; categories?: string[] };
    };
    return {
      data: json.data ?? [],
      meta: {
        page: json.meta?.page ?? 1,
        limit: json.meta?.limit ?? 12,
        total: json.meta?.total ?? 0,
        pages: json.meta?.pages ?? 0,
        categories: json.meta?.categories ?? [],
      },
    };
  } catch {
    return null;
  }
}

export async function getBlogBySlug(slug: string): Promise<Blog & { related: Blog[] } | null> {
  return fetchJson<Blog & { related: Blog[] }>(`/api/v1/public/blogs/${slug}`);
}

export async function getJobs(): Promise<{ data: Job[]; departments: string[] } | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/public/careers`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = (await res.json()) as { data: Job[]; meta?: { departments?: string[] } };
    return { data: json.data ?? [], departments: json.meta?.departments ?? [] };
  } catch {
    return null;
  }
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  return fetchJson<Job>(`/api/v1/public/careers/${slug}`);
}
