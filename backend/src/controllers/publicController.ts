import { Request, Response } from "express";
import { ServiceModel } from "../models/Service";
import { PortfolioProjectModel } from "../models/PortfolioProject";
import { TeamMemberModel } from "../models/TeamMember";
import { TestimonialModel } from "../models/Testimonial";
import { FAQModel } from "../models/FAQ";
import { WebsiteSettingModel } from "../models/WebsiteSetting";
import { SEOSettingModel } from "../models/SEOSetting";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export async function getSettings() {
  const docs = await WebsiteSettingModel.find().lean();
  const out: Record<string, Record<string, unknown>> = {};
  for (const d of docs) {
    if (!out[d.group]) out[d.group] = {};
    out[d.group][d.key] = d.value;
  }
  return out;
}

export async function getSEO(page: string) {
  const doc = await SEOSettingModel.findOne({ page }).lean();
  if (!doc) return SEOSettingModel.findOne({ page: "global" }).lean();
  return doc;
}

export const getPublicSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await getSettings();
  res.status(200).json({ success: true, data: settings });
});

export const getSiteBundle = asyncHandler(async (_req: Request, res: Response) => {
  const [settings, services, portfolio, team, testimonials, faqs, seo] = await Promise.all([
    getSettings(),
    ServiceModel.find({ published: true }).sort({ order: 1 }).lean(),
    PortfolioProjectModel.find({ status: "published" }).sort({ order: 1 }).lean(),
    TeamMemberModel.find({ published: true }).sort({ order: 1 }).lean(),
    TestimonialModel.find({ published: true }).sort({ order: 1 }).lean(),
    FAQModel.find({ published: true }).sort({ order: 1 }).lean(),
    getSEO("home"),
  ]);
  res.status(200).json({
    success: true,
    data: { settings, services, portfolio, team, testimonials, faqs, seo },
  });
});

export const getHomeBundle = asyncHandler(async (_req: Request, res: Response) => {
  const [settings, services, portfolio, team, testimonials, faqs, seo] = await Promise.all([
    getSettings(),
    ServiceModel.find({ published: true }).sort({ order: 1 }).limit(12).lean(),
    PortfolioProjectModel.find({ status: "published" }).sort({ order: 1 }).limit(9).lean(),
    TeamMemberModel.find({ published: true }).sort({ order: 1 }).limit(12).lean(),
    TestimonialModel.find({ published: true }).sort({ order: 1 }).lean(),
    FAQModel.find({ published: true }).sort({ order: 1 }).lean(),
    getSEO("home"),
  ]);
  res.status(200).json({ success: true, data: { settings, services, portfolio, team, testimonials, faqs, seo } });
});

export const listServices = asyncHandler(async (_req: Request, res: Response) => {
  const services = await ServiceModel.find({ published: true }).sort({ order: 1 }).lean();
  res.status(200).json({ success: true, data: services });
});

export const getService = asyncHandler(async (req: Request, res: Response) => {
  const service = await ServiceModel.findOne({ slug: req.params.slug, published: true }).lean();
  if (!service) throw ApiError.notFound("Service not found");
  res.status(200).json({ success: true, data: service });
});

export const listPortfolio = asyncHandler(async (req: Request, res: Response) => {
  const { category, q } = req.query as { category?: string; q?: string };
  const filter: Record<string, unknown> = { status: "published" };
  if (category && category !== "All") filter.category = category;
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } },
      { technologies: { $regex: q, $options: "i" } },
    ];
  }
  const projects = await PortfolioProjectModel.find(filter).sort({ order: 1, createdAt: -1 }).lean();
  const categories = await PortfolioProjectModel.distinct("category", { status: "published" });
  res.status(200).json({ success: true, data: projects, meta: { categories } });
});

export const getPortfolioProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await PortfolioProjectModel.findOne({ slug: req.params.slug, status: "published" }).lean();
  if (!project) throw ApiError.notFound("Project not found");
  res.status(200).json({ success: true, data: project });
});

export const listTeam = asyncHandler(async (_req: Request, res: Response) => {
  const team = await TeamMemberModel.find({ published: true }).sort({ order: 1 }).lean();
  res.status(200).json({ success: true, data: team });
});

export const listTestimonials = asyncHandler(async (_req: Request, res: Response) => {
  const testimonials = await TestimonialModel.find({ published: true }).sort({ order: 1 }).lean();
  res.status(200).json({ success: true, data: testimonials });
});

export const listFaqs = asyncHandler(async (_req: Request, res: Response) => {
  const faqs = await FAQModel.find({ published: true }).sort({ order: 1 }).lean();
  res.status(200).json({ success: true, data: faqs });
});

export const getSeoByPage = asyncHandler(async (req: Request, res: Response) => {
  const seo = await getSEO(req.params.page);
  res.status(200).json({ success: true, data: seo });
});

export const getEstimatorConfig = asyncHandler(async (_req: Request, res: Response) => {
  const [settings, services] = await Promise.all([
    getSettings(),
    ServiceModel.find({ published: true }).sort({ order: 1 }).lean(),
  ]);
  res.status(200).json({ success: true, data: { settings: settings.estimator || {}, services } });
});
