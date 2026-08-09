import { Request, Response } from "express";
import { PaymentModel, PAYMENT_STATUSES } from "../models/Payment";
import { LeadModel } from "../models/Lead";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { logActivity } from "../services/activityService";
import { notify } from "../services/notificationService";
import { createPaymentLink as createRazorpayPaymentLink, isRazorpayConfigured, verifyWebhookSignature as verifyRazorpaySignature } from "../services/razorpayService";
import { sendPaymentLinkTemplate, formatINR } from "../services/whatsappService";
import { logger } from "../utils/logger";

const ACTIVE_STATUSES = ["created", "link_created", "sent"];
const TERMINAL_STATUSES = ["paid", "failed", "expired", "cancelled"];

// ---------- List / Get / Stats ----------

export const listPayments = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const { q, status, leadId, startDate, endDate, sort } = req.query;

  const filter: Record<string, unknown> = {};
  if (q) {
    filter.$or = [
      { paymentRef: { $regex: q, $options: "i" } },
      { "leadSnapshot.name": { $regex: q, $options: "i" } },
      { "leadSnapshot.company": { $regex: q, $options: "i" } },
      { "leadSnapshot.whatsapp": { $regex: q, $options: "i" } },
      { "leadSnapshot.phone": { $regex: q, $options: "i" } },
      { "leadSnapshot.email": { $regex: q, $options: "i" } },
    ];
  }
  if (status) filter.status = status;
  if (leadId) filter.lead = leadId;
  if (startDate || endDate) {
    filter.createdAt = {} as Record<string, unknown>;
    if (startDate) (filter.createdAt as Record<string, unknown>).$gte = new Date(startDate as string);
    if (endDate) (filter.createdAt as Record<string, unknown>).$lte = new Date(endDate as string);
  }

  const sortOptions: Record<string, 1 | -1> =
    sort === "oldest" ? { createdAt: 1 } : sort === "amount" ? { amountPaise: -1 } : { createdAt: -1 };

  const total = await PaymentModel.countDocuments(filter);
  const data = await PaymentModel.find(filter)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("lead", "leadId name company whatsapp phone")
    .populate("createdBy", "name email")
    .lean();

  res.status(200).json({ success: true, data, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const paymentStats = asyncHandler(async (_req: Request, res: Response) => {
  const [total, byStatus, collected, due] = await Promise.all([
    PaymentModel.countDocuments(),
    PaymentModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    PaymentModel.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, amountPaise: { $sum: "$amountPaise" } } },
    ]),
    PaymentModel.aggregate([
      { $match: { status: { $in: ACTIVE_STATUSES } } },
      { $group: { _id: null, amountPaise: { $sum: "$amountPaise" } } },
    ]),
  ]);
  res.status(200).json({
    success: true,
    data: {
      total,
      paid: byStatus.find((s) => s._id === "paid")?.count || 0,
      outstanding: byStatus.filter((s) => ACTIVE_STATUSES.includes(s._id)).reduce((sum, s) => sum + s.count, 0),
      collectedPaise: collected[0]?.amountPaise || 0,
      outstandingPaise: due[0]?.amountPaise || 0,
      byStatus,
    },
  });
});

export const getPayment = asyncHandler(async (req: Request, res: Response) => {
  const doc = await PaymentModel.findById(req.params.id)
    .populate("lead", "leadId name company whatsapp phone email")
    .populate("createdBy", "name email")
    .populate("approvedBy", "name email")
    .lean();
  if (!doc) throw ApiError.notFound("Payment not found");
  res.status(200).json({ success: true, data: doc });
});

// ---------- Create ----------

export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as {
    leadId: string;
    amount: number;
    currency?: string;
    description?: string;
    clientApproved?: boolean;
    force?: boolean;
  };

  const lead = (await LeadModel.findById(body.leadId).lean()) as unknown as
    | {
        _id: string;
        leadId: string;
        name: string;
        company: string;
        email: string;
        phone: string;
        whatsapp: string;
      }
    | null;
  if (!lead) throw ApiError.notFound("Lead not found");

  // Guard against duplicate active requests for the same lead (unless forced).
  const existing = (await PaymentModel.findOne({ lead: lead._id, status: { $in: ACTIVE_STATUSES } }).sort({ createdAt: -1 }).lean()) as unknown as { paymentRef: string } | null;
  if (existing && !body.force) {
    throw ApiError.conflict(`Lead already has an active payment request (${existing.paymentRef}). Set force to override.`);
  }

  const amountPaise = Math.round(Number(body.amount) * 100);
  if (!Number.isFinite(amountPaise) || amountPaise < 100) {
    throw ApiError.badRequest("Amount must be at least ₹1");
  }

  const clientApproved = Boolean(body.clientApproved);
  const doc = await PaymentModel.create({
    lead: lead._id,
    leadSnapshot: {
      leadId: lead.leadId || "",
      name: lead.name || "",
      company: lead.company || "",
      email: lead.email || "",
      phone: lead.phone || "",
      whatsapp: lead.whatsapp || "",
    },
    amountPaise,
    currency: (body.currency || "INR").toUpperCase(),
    description: body.description || "",
    clientApproved,
    approvedBy: clientApproved ? req.user!._id : null,
    approvedAt: clientApproved ? new Date() : null,
    createdBy: req.user!._id,
    status: "created",
    timeline: [
      {
        action: "created",
        description: `Payment request created for ${formatINR(amountPaise)}`,
        by: req.user!._id,
        byName: req.user!.name,
        meta: { amountPaise },
      },
    ],
  });

  await logActivity({ user: req.user, action: "create", entity: "payment", entityId: doc._id, description: `Created payment ${doc.paymentRef} (${lead.name})`, req });
  res.status(201).json({ success: true, data: doc });
});

// ---------- Generate Razorpay link ----------

export const createPaymentLink = asyncHandler(async (req: Request, res: Response) => {
  const doc = await PaymentModel.findById(req.params.id);
  if (!doc) throw ApiError.notFound("Payment not found");

  if (!doc.clientApproved) {
    throw ApiError.badRequest("Client approval is required before generating the payment link");
  }
  if (TERMINAL_STATUSES.includes(doc.status)) {
    throw ApiError.badRequest(`Cannot generate a link for a ${doc.status} payment`);
  }
  if (doc.razorpay.linkId && doc.razorpay.shortUrl) {
    return res.status(200).json({ success: true, data: doc });
  }
  if (!isRazorpayConfigured()) {
    throw ApiError.internal("Razorpay is not configured (RAZORPAY_KEY_ID/KEY_SECRET). Link generation is disabled.");
  }

  let link;
  try {
    link = await createRazorpayPaymentLink({
      amountPaise: doc.amountPaise,
      currency: doc.currency,
      description: doc.description || `Payment ${doc.paymentRef}`,
      customer: {
        name: doc.leadSnapshot.name || "Client",
        email: doc.leadSnapshot.email || "",
        contact: doc.leadSnapshot.phone || doc.leadSnapshot.whatsapp || "",
      },
      notes: { payment_ref: doc.paymentRef, c2d_payment_ref: doc.paymentRef },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`[payment:link] failed for ${doc.paymentRef}: ${message}`);
    throw ApiError.internal(message.includes("RAZORPAY_LINK_FAILED") ? message.replace(/^RAZORPAY_LINK_FAILED: /, "") : "Failed to generate Razorpay payment link");
  }

  doc.razorpay.linkId = link.linkId;
  doc.razorpay.shortUrl = link.shortUrl;
  doc.razorpay.entityId = link.entityId;
  if (doc.status === "created") doc.status = "link_created";
  doc.timeline.push({
    action: "link_created",
    description: "Razorpay payment link generated",
    by: req.user!._id,
    byName: req.user!.name,
    meta: { linkId: link.linkId, shortUrl: link.shortUrl },
  });
  await doc.save();

  await logActivity({ user: req.user, action: "link_created", entity: "payment", entityId: doc._id, description: `Generated payment link for ${doc.paymentRef}`, req });
  res.status(200).json({ success: true, data: doc });
});

// ---------- Send / Resend via WhatsApp ----------

async function sendLinkInternal(req: Request, doc: any) {
  if (!doc.razorpay.shortUrl) throw ApiError.badRequest("Generate the payment link before sending");
  if (doc.status === "paid") throw ApiError.badRequest("Payment already received");

  const to = doc.leadSnapshot.whatsapp || doc.leadSnapshot.phone || "";
  if (!to) throw ApiError.badRequest("No WhatsApp or phone number on the lead");

  const result = await sendPaymentLinkTemplate({
    to,
    clientName: doc.leadSnapshot.name || "Client",
    amountPaise: doc.amountPaise,
    description: doc.description || `Payment ${doc.paymentRef}`,
    paymentLink: doc.razorpay.shortUrl,
  });

  if (!result.ok) {
    doc.whatsapp.error = result.error || "";
    doc.timeline.push({
      action: "whatsapp_failed",
      description: `WhatsApp send failed: ${result.error}`,
      by: req.user!._id,
      byName: req.user!.name,
      meta: { error: result.error },
    });
    await doc.save();
    throw ApiError.internal(`Failed to send WhatsApp message: ${result.error}`);
  }

  doc.whatsapp.messageId = result.messageId || "";
  doc.whatsapp.sentTo = to;
  doc.whatsapp.status = "sent";
  doc.whatsapp.error = "";
  doc.status = "sent";
  doc.timeline.push({
    action: "whatsapp_sent",
    description: "Payment link sent via WhatsApp",
    by: req.user!._id,
    byName: req.user!.name,
    meta: { messageId: result.messageId, to },
  });
  await doc.save();
  return doc;
}

export const sendPaymentLink = asyncHandler(async (req: Request, res: Response) => {
  const doc = await PaymentModel.findById(req.params.id);
  if (!doc) throw ApiError.notFound("Payment not found");
  if (doc.status !== "link_created") {
    throw ApiError.badRequest(`Payment link can only be sent when a link exists (status: ${doc.status})`);
  }
  const updated = await sendLinkInternal(req, doc);
  await logActivity({ user: req.user, action: "send", entity: "payment", entityId: updated._id, description: `Sent payment link via WhatsApp for ${updated.paymentRef}`, req });
  res.status(200).json({ success: true, data: updated });
});

export const resendPaymentLink = asyncHandler(async (req: Request, res: Response) => {
  const doc = await PaymentModel.findById(req.params.id);
  if (!doc) throw ApiError.notFound("Payment not found");
  if (doc.status !== "sent") {
    throw ApiError.badRequest(`Only sent payments can be resent (status: ${doc.status})`);
  }
  const updated = await sendLinkInternal(req, doc);
  await logActivity({ user: req.user, action: "resend", entity: "payment", entityId: updated._id, description: `Resent payment link via WhatsApp for ${updated.paymentRef}`, req });
  res.status(200).json({ success: true, data: updated });
});

// ---------- Cancel ----------

export const cancelPayment = asyncHandler(async (req: Request, res: Response) => {
  const doc = await PaymentModel.findById(req.params.id);
  if (!doc) throw ApiError.notFound("Payment not found");
  if (doc.status === "paid") throw ApiError.badRequest("Cannot cancel a paid payment");
  if (TERMINAL_STATUSES.includes(doc.status)) {
    throw ApiError.badRequest(`Payment is already ${doc.status}`);
  }
  doc.status = "cancelled";
  doc.timeline.push({ action: "cancelled", description: "Payment request cancelled", by: req.user!._id, byName: req.user!.name });
  await doc.save();
  await logActivity({ user: req.user, action: "cancel", entity: "payment", entityId: doc._id, description: `Cancelled payment ${doc.paymentRef}`, req });
  res.status(200).json({ success: true, data: doc });
});

// ---------- Razorpay webhook ----------

interface RazorpayWebhookPayload {
  event?: string;
  payload?: {
    payment_link?: { entity?: { id?: string; notes?: Record<string, string>; status?: string } };
    payment?: {
      entity?: {
        id?: string;
        amount?: number;
        method?: string;
        paid_at?: number;
        order_id?: string;
        notes?: Record<string, string>;
        error_description?: string;
      };
    };
  };
}

export const razorpayWebhook = asyncHandler(async (req: Request, res: Response) => {
  const raw = (req.body as Buffer | undefined);
  if (!raw) return res.status(400).json({ success: false, error: "missing body" });
  const rawBody = raw.toString("utf8");
  const signature = String(req.headers["x-razorpay-signature"] || "");

  if (!verifyRazorpaySignature(rawBody, signature)) {
    logger.warn("[razorpay-webhook] signature verification failed");
    return res.status(400).json({ success: false, error: "invalid signature" });
  }

  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    return res.status(400).json({ success: false, error: "invalid json" });
  }

  const event = payload.event || "";
  const linkEntity = payload.payload?.payment_link?.entity;
  const paymentEntity = payload.payload?.payment?.entity;
  const notes = linkEntity?.notes || paymentEntity?.notes || {};
  const paymentRef = String(notes.payment_ref || notes.c2d_payment_ref || "").trim();

  if (!paymentRef) {
    return res.status(200).json({ success: true, ignored: "no payment_ref in notes" });
  }

  const doc = await PaymentModel.findOne({ paymentRef });
  if (!doc) {
    logger.warn(`[razorpay-webhook] unknown payment_ref "${paymentRef}" for event "${event}"`);
    return res.status(200).json({ success: true, ignored: "unknown payment" });
  }

  // Idempotency: a terminal state is never re-processed.
  if (doc.status === "paid") {
    return res.status(200).json({ success: true, idempotent: true });
  }
  if (event === "payment.captured" && paymentEntity?.id && doc.payment.razorpayPaymentId === paymentEntity.id) {
    return res.status(200).json({ success: true, idempotent: true });
  }

  switch (event) {
    case "payment_link.created":
      doc.status = "link_created";
      doc.timeline.push({ action: "link_created", description: "Payment link created on Razorpay", by: null, byName: "Razorpay", meta: { event, id: linkEntity?.id } });
      break;
    case "payment.captured":
    case "payment_link.paid":
      doc.status = "paid";
      doc.payment.razorpayPaymentId = paymentEntity?.id || doc.payment.razorpayPaymentId;
      doc.payment.amountPaidPaise = paymentEntity?.amount || doc.amountPaise;
      doc.payment.method = paymentEntity?.method || doc.payment.method;
      doc.payment.webhookEvent = event;
      doc.payment.paidAt = paymentEntity?.paid_at ? new Date(paymentEntity.paid_at * 1000) : new Date();
      doc.payment.note = `Marked paid via ${event}`;
      doc.timeline.push({
        action: "paid",
        description: `Payment received (${formatINR(doc.payment.amountPaidPaise)}) via Razorpay`,
        by: null,
        byName: "Razorpay",
        meta: { event, paymentId: paymentEntity?.id, method: doc.payment.method },
      });
      await notify({
        type: "payment",
        title: "Payment received",
        message: `${doc.paymentRef} · ${formatINR(doc.payment.amountPaidPaise)} from ${doc.leadSnapshot.name || "client"}`,
        entityType: "payment",
        entityId: doc.paymentRef,
        link: `/admin/payments`,
      });
      await logActivity({ user: null, action: "paid", entity: "payment", entityId: doc._id, description: `${doc.paymentRef} marked paid via Razorpay webhook`, req });
      break;
    case "payment.failed":
      if (!TERMINAL_STATUSES.includes(doc.status)) {
        doc.status = "failed";
        doc.timeline.push({
          action: "failed",
          description: paymentEntity?.error_description || "Payment attempt failed",
          by: null,
          byName: "Razorpay",
          meta: { event },
        });
      }
      break;
    case "payment_link.cancelled":
      if (!TERMINAL_STATUSES.includes(doc.status)) {
        doc.status = "cancelled";
        doc.timeline.push({ action: "cancelled", description: "Payment link cancelled by Razorpay", by: null, byName: "Razorpay", meta: { event } });
      }
      break;
    case "payment_link.expired":
      if (!TERMINAL_STATUSES.includes(doc.status)) {
        doc.status = "expired";
        doc.timeline.push({ action: "expired", description: "Payment link expired", by: null, byName: "Razorpay", meta: { event } });
      }
      break;
    default:
      doc.timeline.push({ action: "webhook", description: `Webhook: ${event}`, by: null, byName: "Razorpay", meta: { event, id: linkEntity?.id || paymentEntity?.id } });
      break;
  }

  await doc.save();
  res.status(200).json({ success: true, event });
});
