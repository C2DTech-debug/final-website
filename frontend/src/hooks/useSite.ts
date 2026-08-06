import { useQuery } from "@tanstack/react-query";
import { api, apiFetchPaginated, qs } from "@/lib/api";
import type {
  HomeBundle,
  PublicSettings,
  Service,
  PortfolioProject,
  TeamMember,
  Testimonial,
  Faq,
  EstimatorConfig,
  QuoteResult,
} from "@/types";

export const siteKeys = {
  bundle: ["site", "bundle"] as const,
  settings: ["site", "settings"] as const,
  home: ["site", "home"] as const,
  services: ["site", "services"] as const,
  service: (slug: string) => ["site", "service", slug] as const,
  portfolio: (params: Record<string, string | undefined>) => ["site", "portfolio", params] as const,
  project: (slug: string) => ["site", "project", slug] as const,
  team: ["site", "team"] as const,
  testimonials: ["site", "testimonials"] as const,
  faqs: ["site", "faqs"] as const,
  estimator: ["site", "estimator-config"] as const,
};

export function useSiteBundle() {
  return useQuery({ queryKey: siteKeys.bundle, queryFn: () => api.get<HomeBundle>("/api/v1/public/bundle") });
}

export function useSiteSettings() {
  return useQuery({ queryKey: siteKeys.settings, queryFn: () => api.get<PublicSettings>("/api/v1/public/settings") });
}

export function useHomeBundle() {
  return useQuery({ queryKey: siteKeys.home, queryFn: () => api.get<HomeBundle>("/api/v1/public/home") });
}

export function usePublicServices() {
  return useQuery({ queryKey: siteKeys.services, queryFn: () => api.get<Service[]>("/api/v1/public/services") });
}

export function usePublicService(slug: string) {
  return useQuery({ queryKey: siteKeys.service(slug), queryFn: () => api.get<Service>(`/api/v1/public/services/${slug}`), enabled: Boolean(slug) });
}

export function usePublicPortfolio(params: { category?: string; q?: string } = {}) {
  return useQuery({
    queryKey: siteKeys.portfolio(params),
    queryFn: () => apiFetchPaginated<PortfolioProject, { categories: string[] }>(`/api/v1/public/portfolio${qs(params)}`),
  });
}

export function usePublicProject(slug: string) {
  return useQuery({ queryKey: siteKeys.project(slug), queryFn: () => api.get<PortfolioProject>(`/api/v1/public/portfolio/${slug}`), enabled: Boolean(slug) });
}

export function usePublicTeam() {
  return useQuery({ queryKey: siteKeys.team, queryFn: () => api.get<TeamMember[]>("/api/v1/public/team") });
}

export function usePublicTestimonials() {
  return useQuery({ queryKey: siteKeys.testimonials, queryFn: () => api.get<Testimonial[]>("/api/v1/public/testimonials") });
}

export function usePublicFaqs() {
  return useQuery({ queryKey: siteKeys.faqs, queryFn: () => api.get<Faq[]>("/api/v1/public/faqs") });
}

export function useEstimatorConfig() {
  return useQuery({ queryKey: siteKeys.estimator, queryFn: () => api.get<EstimatorConfig>("/api/v1/public/estimator-config") });
}

export async function fetchQuote(services: string[], addons: string[]): Promise<QuoteResult> {
  return api.post<QuoteResult>("/api/v1/estimator/quote", { services, addons }, { auth: false });
}

export async function submitEstimate(payload: {
  name: string;
  email: string;
  phone: string;
  services: string[];
  addons: string[];
  notes: string;
  recaptchaToken?: string;
}) {
  return api.post<{ id: string; totalCost: number; currency: string; timeline: string; message: string }>(
    "/api/v1/estimator/submit",
    { ...payload, recaptchaToken: payload.recaptchaToken || "" },
    { auth: false }
  );
}

export async function submitContact(payload: {
  name: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  timeline: string;
  message: string;
  recaptchaToken?: string;
}) {
  return api.post<{ id: string; message: string }>(
    "/api/v1/contact",
    { ...payload, recaptchaToken: payload.recaptchaToken || "" },
    { auth: false }
  );
}

export async function subscribeNewsletter(payload: { email: string; name?: string; source?: string }) {
  return api.post<{ message: string }>(
    "/api/v1/newsletter/subscribe",
    { ...payload, recaptchaToken: "" },
    { auth: false }
  );
}

export async function trackVisit(path: string, referrer: string) {
  return api.post<{ tracked: boolean }>(
    "/api/v1/analytics/visit",
    { path, referrer, session: "" },
    { auth: false, retryAuth: false }
  );
}
