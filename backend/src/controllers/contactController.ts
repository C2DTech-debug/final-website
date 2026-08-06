import { Request, Response } from "express";
import { ContactMessageModel } from "../models/ContactMessage";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { verifyRecaptcha } from "../middleware/security";
import { sendMail, contactAcknowledgement, contactAdminNotification } from "../services/emailService";
import { logActivity } from "../services/activityService";
import { notify } from "../services/notificationService";
import { LeadModel } from "../models/Lead";
import { env } from "../config/env";
import { AdminUserModel } from "../models/AdminUser";

export const submitContact = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  const recaptchaOk = await verifyRecaptcha(body.recaptchaToken || "");
  if (!recaptchaOk) throw ApiError.badRequest("reCAPTCHA verification failed");

  const message = await ContactMessageModel.create({
    name: body.name,
    email: body.email,
    phone: body.phone || "",
    service: body.service || "",
    budget: body.budget || "",
    timeline: body.timeline || "",
    message: body.message,
    ip: req.ip || "",
    userAgent: req.headers["user-agent"] || "",
  });

  // Mirror every enquiry into the Lead CRM pipeline.
  await LeadModel.create({
    name: body.name,
    email: body.email,
    phone: body.phone || "",
    service: body.service || "",
    budget: body.budget || "",
    source: "contact_form",
    status: "new",
    tags: body.service ? ["contact-form", body.service] : ["contact-form"],
    ip: req.ip || "",
    userAgent: req.headers["user-agent"] || "",
    timeline: [{ action: "created", description: "Lead created from contact form" }],
  });
  await notify({ type: "contact", title: `New enquiry from ${body.name}`, message: body.service ? `Service: ${body.service}` : "", link: "/admin/leads", entityType: "contact" });

  // Fire-and-forget emails (never block the response)
  void sendMail({ to: body.email, subject: "We received your message — C2D Tech", html: contactAcknowledgement(body.name) });
  if (env.SMTP.ADMIN_TO) {
    void sendMail({
      to: env.SMTP.ADMIN_TO,
      subject: `New enquiry from ${body.name}`,
      html: contactAdminNotification(body),
    });
  }
  if (env.WHATSAPP_ADMIN_NUMBER) {
    // Optional admin WhatsApp notification (link-based, no external dependency)
    const text = encodeURIComponent(`New enquiry from ${body.name} (${body.email}): ${body.message.slice(0, 160)}`);
    const url = `https://wa.me/${env.WHATSAPP_ADMIN_NUMBER}?text=${text}`;
    void fetch(url).catch(() => undefined);
  }

  res.status(201).json({ success: true, data: { id: message._id, message: "Message received. We will get back to you within 24 hours." } });
});

export const listContacts = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const { q, status, service, startDate, endDate, assignedTo } = req.query;

  const filter: Record<string, unknown> = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { message: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
    ];
  }
  if (status) filter.status = status;
  if (service) filter.service = { $regex: service, $options: "i" };
  if (assignedTo) filter.assignedTo = assignedTo;
  if (startDate || endDate) {
    filter.createdAt = {} as Record<string, unknown>;
    if (startDate) (filter.createdAt as Record<string, unknown>).$gte = new Date(startDate as string);
    if (endDate) (filter.createdAt as Record<string, unknown>).$lte = new Date(endDate as string);
  }

  const total = await ContactMessageModel.countDocuments(filter);
  const data = await ContactMessageModel.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("assignedTo", "name email")
    .lean();

  res.status(200).json({ success: true, data, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const getContact = asyncHandler(async (req: Request, res: Response) => {
  const doc = await ContactMessageModel.findById(req.params.id).populate("assignedTo", "name email").lean();
  if (!doc) throw ApiError.notFound("Message not found");
  res.status(200).json({ success: true, data: doc });
});

export const updateContact = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = await ContactMessageModel.findById(id);
  if (!doc) throw ApiError.notFound("Message not found");
  const { status, assignedTo } = req.body;
  if (status) doc.status = status;
  if (assignedTo !== undefined) doc.assignedTo = assignedTo ? assignedTo : null;
  await doc.save();
  await logActivity({ user: req.user, action: "update", entity: "contact", entityId: id, description: `Updated lead status to "${doc.status}"`, req });
  res.status(200).json({ success: true, data: doc });
});

export const replyToContact = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = await ContactMessageModel.findById(id);
  if (!doc) throw ApiError.notFound("Message not found");
  doc.replies.push({
    body: req.body.body,
    by: req.user!._id,
    byName: req.user!.name,
  });
  if (doc.status === "new") doc.status = "contacted";
  await doc.save();

  void sendMail({
    to: doc.email,
    subject: `Re: your enquiry — C2D Tech`,
    html: `<div style="font-family:sans-serif;color:#111827;line-height:1.6"><h3>Hello ${doc.name},</h3><p>${req.body.body.replace(/\n/g, "<br/>")}</p><p>— ${req.user!.name}, C2D Tech</p></div>`,
  });

  await logActivity({ user: req.user, action: "reply", entity: "contact", entityId: id, description: `Replied to ${doc.name}`, req });
  res.status(200).json({ success: true, data: doc });
});

export const deleteContact = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = await ContactMessageModel.findByIdAndDelete(id);
  if (!doc) throw ApiError.notFound("Message not found");
  await logActivity({ user: req.user, action: "delete", entity: "contact", entityId: id, description: `Deleted message from ${doc.name}`, req });
  res.status(200).json({ success: true, data: { message: "Message deleted" } });
});

export const listAdminUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await AdminUserModel.find().select("_id name email role").lean();
  res.status(200).json({ success: true, data: users });
});
