import { Request, Response } from "express";
import { NewsletterSubscriberModel } from "../models/NewsletterSubscriber";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { verifyRecaptcha } from "../middleware/security";
import { logActivity } from "../services/activityService";

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const { email, name, source, recaptchaToken } = req.body;
  const recaptchaOk = await verifyRecaptcha(recaptchaToken || "");
  if (!recaptchaOk) throw ApiError.badRequest("reCAPTCHA verification failed");

  const existing = await NewsletterSubscriberModel.findOne({ email });
  if (existing) {
    if (existing.status === "unsubscribed") {
      existing.status = "subscribed";
      existing.unsubscribedAt = undefined;
      await existing.save();
    }
    return res.status(200).json({ success: true, data: { message: "You are already subscribed." } });
  }

  await NewsletterSubscriberModel.create({ email, name: name || "", source: source || "footer" });
  res.status(201).json({ success: true, data: { message: "Subscribed successfully!" } });
});

export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.params;
  const sub = await NewsletterSubscriberModel.findOne({ email: decodeURIComponent(email) });
  if (sub) {
    sub.status = "unsubscribed";
    sub.unsubscribedAt = new Date();
    await sub.save();
  }
  res.status(200).json({ success: true, data: { message: "You have been unsubscribed." } });
});

export const listSubscribers = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const { q, status } = req.query;
  const filter: Record<string, unknown> = {};
  if (q) filter.email = { $regex: q, $options: "i" };
  if (status) filter.status = status;

  const total = await NewsletterSubscriberModel.countDocuments(filter);
  const data = await NewsletterSubscriberModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
  res.status(200).json({ success: true, data, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const deleteSubscriber = asyncHandler(async (req: Request, res: Response) => {
  const doc = await NewsletterSubscriberModel.findByIdAndDelete(req.params.id);
  if (!doc) throw ApiError.notFound("Subscriber not found");
  await logActivity({ user: req.user, action: "delete", entity: "subscriber", entityId: req.params.id, description: `Deleted subscriber ${doc.email}`, req });
  res.status(200).json({ success: true, data: { message: "Subscriber deleted" } });
});
