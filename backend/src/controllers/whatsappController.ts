import { Request, Response } from "express";
import { env } from "../config/env";
import { asyncHandler } from "../utils/asyncHandler";
import { PaymentModel } from "../models/Payment";
import { verifyWebhookSignature } from "../services/whatsappService";
import { logActivity } from "../services/activityService";
import { logger } from "../utils/logger";

/** Meta webhook verification (GET) — echoes hub.challenge when the token matches. */
export const whatsappWebhookVerify = (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token && token === env.WHATSAPP.WEBHOOK_VERIFY_TOKEN) {
    logger.info("[whatsapp-webhook] subscription verified");
    return res.status(200).send(challenge);
  }
  logger.warn("[whatsapp-webhook] verification failed");
  return res.status(403).send("Verification failed");
};

interface StatusUpdate {
  id?: string;
  status?: string;
  timestamp?: string;
  errors?: { code?: number; title?: string }[];
}

/** Delivery / read / failure receipts for the payment-link template. */
export const whatsappWebhook = asyncHandler(async (req: Request, res: Response) => {
  const raw = req.body as Buffer | undefined;
  if (!raw) return res.status(400).json({ success: false, error: "missing body" });
  const rawBody = raw.toString("utf8");
  const signature = String(req.headers["x-hub-signature-256"] || "");

  if (!verifyWebhookSignature(rawBody, signature)) {
    logger.warn("[whatsapp-webhook] signature verification failed");
    return res.status(400).json({ success: false, error: "invalid signature" });
  }

  let payload: {
    entry?: { changes?: { value?: { statuses?: StatusUpdate[] } }[] }[];
  };
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return res.status(400).json({ success: false, error: "invalid json" });
  }

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      for (const status of change.value?.statuses || []) {
        await applyStatusUpdate(status);
      }
    }
  }

  res.status(200).json({ success: true });
});

async function applyStatusUpdate(status: StatusUpdate) {
  if (!status.id) return;
  try {
    const doc = await PaymentModel.findOne({ "whatsapp.messageId": status.id });
    if (!doc) return;
    if (status.status) {
      doc.whatsapp.status = status.status;
    }
    const failed = status.errors?.[0];
    if (failed) doc.whatsapp.error = failed.title || `WHATSAPP_ERROR ${failed.code || ""}`.trim();
    doc.timeline.push({
      action: `whatsapp_${status.status || "update"}`,
      description: `WhatsApp message ${status.status || "updated"}${failed ? `: ${failed.title}` : ""}`,
      by: null,
      byName: "WhatsApp",
      meta: { messageId: status.id },
    });
    await doc.save();
    await logActivity({ user: null, action: "whatsapp_status", entity: "payment", entityId: doc._id, description: `${doc.paymentRef} WhatsApp ${status.status}`, details: { messageId: status.id } });
  } catch (error) {
    logger.error("[whatsapp-webhook] failed to apply status update", error);
  }
}
