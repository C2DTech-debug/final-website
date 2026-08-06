import { Request, Response } from "express";
import { ServiceModel } from "../models/Service";
import { ProjectEstimateModel } from "../models/ProjectEstimate";
import { WebsiteSettingModel } from "../models/WebsiteSetting";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { verifyRecaptcha } from "../middleware/security";
import { sendMail, estimateAdminNotification } from "../services/emailService";
import { logActivity } from "../services/activityService";
import { notify } from "../services/notificationService";
import { LeadModel } from "../models/Lead";
import { env } from "../config/env";

interface AddonDef {
  id: string;
  label: string;
  price: number;
}

async function getEstimatorPricing() {
  const docs = await WebsiteSettingModel.find({ group: "estimator" }).lean();
  const cfg: Record<string, unknown> = {};
  for (const d of docs) cfg[d.key] = d.value;
  return cfg;
}

export async function computeEstimate(body: { services: string[]; addons?: string[] }) {
  const cfg = await getEstimatorPricing();
  const basePrices = (cfg.basePrices as Record<string, number>) || {};
  const addonDefs = (cfg.addons as AddonDef[]) || [];
  const timelineCfg = (cfg.timeline as { base?: number; perService?: number }) || {};

  const services = await ServiceModel.find({ slug: { $in: body.services } }).lean();
  const unknownSlugs = body.services.filter((s) => !services.some((sv) => sv.slug === s));
  if (services.length === 0) throw ApiError.badRequest("Select at least one valid service");

  const serviceNames = services.map((s) => s.name);
  const totalCost = services.reduce((sum, s) => {
    const base = basePrices[s.slug] ?? s.pricing?.startingAt ?? 0;
    return sum + Number(base);
  }, 0);

  const addonTotal = addonDefs
    .filter((a) => (body.addons || []).includes(a.id))
    .reduce((sum, a) => sum + Number(a.price || 0), 0);

  const days = (timelineCfg.base || 14) + (timelineCfg.perService || 7) * services.length;

  return { services, serviceNames, unknownSlugs, totalCost, addonTotal, cost: totalCost + addonTotal, timelineDays: days };
}

export const getEstimateQuote = asyncHandler(async (req: Request, res: Response) => {
  // Server-side quote preview (no persistence). Validated by route schema.
  const { services, addons } = req.body;
  const result = await computeEstimate({ services, addons });
  res.status(200).json({
    success: true,
    data: {
      services: result.serviceNames,
      totalCost: result.cost,
      currency: "INR",
      timelineDays: result.timelineDays,
      timelineLabel: `${result.timelineDays} days`,
    },
  });
});

export const submitEstimate = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  const recaptchaOk = await verifyRecaptcha(body.recaptchaToken || "");
  if (!recaptchaOk) throw ApiError.badRequest("reCAPTCHA verification failed");

  const result = await computeEstimate({ services: body.services, addons: body.addons });

  const estimate = await ProjectEstimateModel.create({
    name: body.name,
    email: body.email,
    phone: body.phone || "",
    services: body.services,
    serviceNames: result.serviceNames,
    addons: body.addons || [],
    totalCost: result.cost,
    currency: "INR",
    timeline: `${result.timelineDays} days`,
    timelineDays: result.timelineDays,
    notes: body.notes || "",
    ip: req.ip || "",
  });

  // Mirror estimator submissions into the Lead CRM pipeline.
  await LeadModel.create({
    name: body.name,
    email: body.email,
    phone: body.phone || "",
    service: result.serviceNames.join(", "),
    budget: `₹${result.cost.toLocaleString("en-IN")}`,
    source: "estimator",
    status: "new",
    tags: ["estimator", ...result.serviceNames.map((n) => n.slice(0, 40))],
    ip: req.ip || "",
    timeline: [{ action: "created", description: `Lead created from project estimator (${result.serviceNames.join(", ")})` }],
  });
  await notify({ type: "estimate", title: `New estimate request from ${body.name}`, message: `₹${result.cost.toLocaleString("en-IN")} · ${result.serviceNames.join(", ")}`, link: "/admin/estimates", entityType: "estimate" });

  void sendMail({
    to: body.email,
    subject: "Your project estimate — C2D Tech",
    html: `<div style="font-family:sans-serif;color:#111827;line-height:1.6"><h3>Hi ${body.name},</h3><p>Thanks for using our estimator. Here is your estimate:</p><p style="font-size:26px;font-weight:700">₹${result.cost.toLocaleString("en-IN")}</p><ul>${result.serviceNames.map((n) => `<li>${n}</li>`).join("")}</ul><p><strong>Estimated delivery:</strong> ${result.timelineDays} days</p><p>We'll reach out shortly to refine this into a final quote.</p><p>— Team C2D Tech</p></div>`,
  });
  if (env.SMTP.ADMIN_TO) {
    void sendMail({
      to: env.SMTP.ADMIN_TO,
      subject: `New estimate request from ${body.name}`,
      html: estimateAdminNotification({ name: body.name, email: body.email, totalCost: `₹${result.cost.toLocaleString("en-IN")}`, timeline: `${result.timelineDays} days`, services: result.serviceNames }),
    });
  }

  res.status(201).json({
    success: true,
    data: {
      id: estimate._id,
      totalCost: result.cost,
      currency: "INR",
      timeline: `${result.timelineDays} days`,
      message: "Estimate submitted. We will contact you shortly.",
    },
  });
});

export const listEstimates = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const { q, status } = req.query;
  const filter: Record<string, unknown> = {};
  if (q) filter.$or = [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }];
  if (status) filter.status = status;

  const total = await ProjectEstimateModel.countDocuments(filter);
  const data = await ProjectEstimateModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("assignedTo", "name email").lean();
  res.status(200).json({ success: true, data, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const updateEstimate = asyncHandler(async (req: Request, res: Response) => {
  const doc = await ProjectEstimateModel.findById(req.params.id);
  if (!doc) throw ApiError.notFound("Estimate not found");
  const { status, assignedTo } = req.body;
  if (status) doc.status = status;
  if (assignedTo !== undefined) doc.assignedTo = assignedTo ? assignedTo : null;
  await doc.save();
  await logActivity({ user: req.user, action: "update", entity: "estimate", entityId: req.params.id, description: `Updated estimate for ${doc.name}`, req });
  res.status(200).json({ success: true, data: doc });
});

export const deleteEstimate = asyncHandler(async (req: Request, res: Response) => {
  const doc = await ProjectEstimateModel.findByIdAndDelete(req.params.id);
  if (!doc) throw ApiError.notFound("Estimate not found");
  await logActivity({ user: req.user, action: "delete", entity: "estimate", entityId: req.params.id, description: `Deleted estimate for ${doc.name}`, req });
  res.status(200).json({ success: true, data: { message: "Estimate deleted" } });
});
