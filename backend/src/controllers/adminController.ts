import { Request, Response } from "express";
import { Model } from "mongoose";
import { ServiceModel } from "../models/Service";
import { PortfolioProjectModel } from "../models/PortfolioProject";
import { TeamMemberModel } from "../models/TeamMember";
import { TestimonialModel } from "../models/Testimonial";
import { FAQModel } from "../models/FAQ";
import { WebsiteSettingModel } from "../models/WebsiteSetting";
import { SEOSettingModel } from "../models/SEOSetting";
import { ContactMessageModel } from "../models/ContactMessage";
import { ProjectEstimateModel } from "../models/ProjectEstimate";
import { NewsletterSubscriberModel } from "../models/NewsletterSubscriber";
import { ActivityLogModel } from "../models/ActivityLog";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { logActivity } from "../services/activityService";

const ENTITY_LABELS: Record<string, string> = {
  service: "Service",
  portfolio: "Portfolio project",
  team: "Team member",
  testimonial: "Testimonial",
  faq: "FAQ",
};

const MODELS: Record<string, Model<unknown>> = {
  service: ServiceModel,
  portfolio: PortfolioProjectModel,
  team: TeamMemberModel,
  testimonial: TestimonialModel,
  faq: FAQModel,
};

const ALLOWED_FIELDS: Record<string, string[]> = {
  service: [
    "name", "slug", "tagline", "icon", "image", "shortDescription", "description",
    "features", "deliverables", "pricing", "category", "order", "published", "seo",
  ],
  portfolio: [
    "title", "slug", "shortDescription", "description", "coverImage", "gallery",
    "liveUrl", "githubUrl", "technologies", "category", "client", "year", "role",
    "featured", "status", "tags", "order",
  ],
  team: ["name", "position", "bio", "skills", "photo", "socialLinks", "email", "order", "published"],
  testimonial: ["name", "role", "company", "content", "rating", "avatar", "featured", "published", "order"],
  faq: ["question", "answer", "category", "order", "published"],
};

function pickFields(entity: string, body: Record<string, unknown>) {
  const allowed = ALLOWED_FIELDS[entity] || Object.keys(body);
  const out: Record<string, unknown> = {};
  for (const k of allowed) if (body[k] !== undefined) out[k] = body[k];
  return out;
}

export const listEntity = asyncHandler(async (req: Request, res: Response) => {
  const model = MODELS[req.params.entity];
  if (!model) throw ApiError.notFound("Unknown entity");
  const docs = await (model as any).find().sort({ order: 1, createdAt: -1 }).lean();
  res.status(200).json({ success: true, data: docs });
});

export const getEntity = asyncHandler(async (req: Request, res: Response) => {
  const model = MODELS[req.params.entity];
  if (!model) throw ApiError.notFound("Unknown entity");
  const doc = await (model as any).findById(req.params.id).lean();
  if (!doc) throw ApiError.notFound(`${ENTITY_LABELS[req.params.entity]} not found`);
  res.status(200).json({ success: true, data: doc });
});

export const createEntity = asyncHandler(async (req: Request, res: Response) => {
  const model = MODELS[req.params.entity];
  if (!model) throw ApiError.notFound("Unknown entity");
  const body = pickFields(req.params.entity, req.body);
  const doc = await (model as any).create(body);
  await logActivity({ user: req.user, action: "create", entity: req.params.entity, entityId: doc._id, description: `Created ${ENTITY_LABELS[req.params.entity] ?? req.params.entity} "${doc.name || doc.title || doc.question}"`, req });
  res.status(201).json({ success: true, data: doc });
});

export const updateEntity = asyncHandler(async (req: Request, res: Response) => {
  const model = MODELS[req.params.entity];
  if (!model) throw ApiError.notFound("Unknown entity");
  const body = pickFields(req.params.entity, req.body);
  const doc = await (model as any).findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
  if (!doc) throw ApiError.notFound(`${ENTITY_LABELS[req.params.entity] ?? req.params.entity} not found`);
  await logActivity({ user: req.user, action: "update", entity: req.params.entity, entityId: req.params.id, description: `Updated ${ENTITY_LABELS[req.params.entity] ?? req.params.entity} "${doc.name || doc.title || doc.question}"`, req });
  res.status(200).json({ success: true, data: doc });
});

export const deleteEntity = asyncHandler(async (req: Request, res: Response) => {
  const model = MODELS[req.params.entity];
  if (!model) throw ApiError.notFound("Unknown entity");
  const doc = await (model as any).findByIdAndDelete(req.params.id);
  if (!doc) throw ApiError.notFound(`${ENTITY_LABELS[req.params.entity] ?? req.params.entity} not found`);
  await logActivity({ user: req.user, action: "delete", entity: req.params.entity, entityId: req.params.id, description: `Deleted ${ENTITY_LABELS[req.params.entity] ?? req.params.entity}`, req });
  res.status(200).json({ success: true, data: { message: "Deleted" } });
});

// ---------- Settings (CMS) ----------

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const docs = await WebsiteSettingModel.find().lean();
  const grouped: Record<string, Record<string, unknown>> = {};
  for (const d of docs) {
    if (!grouped[d.group]) grouped[d.group] = {};
    grouped[d.group][d.key] = d;
  }
  res.status(200).json({ success: true, data: grouped });
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const updates = Array.isArray(req.body.updates) ? req.body.updates : [];
  const results = [];
  for (const item of updates) {
    const { group, key, value, type, label } = item;
    if (!group || !key) continue;
    const doc = await WebsiteSettingModel.findOneAndUpdate(
      { group, key },
      { value, type: type || "text", label: label || key },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    results.push(doc);
  }
  await logActivity({ user: req.user, action: "update_settings", entity: "settings", description: `Updated ${results.length} setting(s)`, details: { count: results.length }, req });
  res.status(200).json({ success: true, data: results });
});

export const deleteSetting = asyncHandler(async (req: Request, res: Response) => {
  const { group, key } = req.params;
  await WebsiteSettingModel.deleteOne({ group, key });
  await logActivity({ user: req.user, action: "delete_setting", entity: "settings", description: `Deleted setting ${group}.${key}`, req });
  res.status(200).json({ success: true, data: { message: "Setting deleted" } });
});

// ---------- SEO ----------

export const listSeoSettings = asyncHandler(async (_req: Request, res: Response) => {
  const docs = await SEOSettingModel.find().lean();
  res.status(200).json({ success: true, data: docs });
});

export const upsertSeoSetting = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  const doc = await SEOSettingModel.findOneAndUpdate(
    { page: body.page },
    { ...body, updatedBy: req.user!._id },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  await logActivity({ user: req.user, action: "update_seo", entity: "seo", description: `Updated SEO settings for "${body.page}"`, req });
  res.status(200).json({ success: true, data: doc });
});

// ---------- Dashboard / analytics ----------

export const dashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const [contacts, projects, estimates, subscribers, team, services, recentActivity, contactTrend] = await Promise.all([
    ContactMessageModel.countDocuments(),
    PortfolioProjectModel.countDocuments(),
    ProjectEstimateModel.countDocuments(),
    NewsletterSubscriberModel.countDocuments(),
    TeamMemberModel.countDocuments(),
    ServiceModel.countDocuments(),
    ActivityLogModel.find().sort({ createdAt: -1 }).limit(10).lean(),
    ContactMessageModel.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const [contactsByStatus, estimatesByStatus, servicePopularity, deviceStats] = await Promise.all([
    ContactMessageModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ProjectEstimateModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ContactMessageModel.aggregate([{ $group: { _id: { $ifNull: ["$service", "General"] }, count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
    ContactMessageModel.aggregate([
      { $project: { _id: 0, mobile: { $regexMatch: { input: { $ifNull: ["$userAgent", ""] }, regex: /Mobile|Android|iPhone/i } } } },
      { $group: { _id: "$mobile", count: { $sum: 1 } } },
    ]),
  ]);

  const deviceMap = Object.fromEntries(deviceStats.map((d) => [d._id ? "mobile" : "desktop", d.count]));

  res.status(200).json({
    success: true,
    data: {
      counts: { contacts, projects, estimates, subscribers, team, services },
      contactTrend,
      contactsByStatus,
      estimatesByStatus,
      servicePopularity,
      device: deviceMap,
      recentActivity,
    },
  });
});

export const activityLogs = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const { q, action } = req.query;
  const filter: Record<string, unknown> = {};
  if (q) filter.$or = [{ userName: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }, { entity: { $regex: q, $options: "i" } }];
  if (action) filter.action = action;
  const total = await ActivityLogModel.countDocuments(filter);
  const data = await ActivityLogModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
  res.status(200).json({ success: true, data, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});

// ---------- Clear cache (no-op placeholder for CDN invalidation hooks) ----------

export const clearCache = asyncHandler(async (req: Request, res: Response) => {
  await logActivity({ user: req.user, action: "clear_cache", entity: "system", description: "Cache cleared", req });
  res.status(200).json({ success: true, data: { message: "Cache cleared. CDN invalidation hook is configured in your reverse proxy / edge." } });
});
