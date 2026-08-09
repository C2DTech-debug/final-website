import crypto from "crypto";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const GRAPH_BASE = "https://graph.facebook.com";

export const isWhatsAppConfigured = (): boolean =>
  Boolean(env.WHATSAPP.ACCESS_TOKEN && env.WHATSAPP.PHONE_NUMBER_ID && env.WHATSAPP.TEMPLATE_NAME);

/** Normalise a phone number to international digits (assumes India when 10 digits). */
export function normalizePhone(input: string): string {
  let digits = String(input || "").replace(/[^\d]/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) digits = `91${digits}`;
  return digits;
}

/** Indian-rupee formatting for template parameters, e.g. ₹5,000. */
export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format((paise || 0) / 100);
}

interface SendPaymentLinkInput {
  to: string;
  clientName: string;
  amountPaise: number;
  description: string;
  paymentLink: string;
}

interface SendResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an approved payment-link template via the WhatsApp Business Cloud API.
 * Template expects 4 body parameters: {client name, amount, description, link}.
 */
export async function sendPaymentLinkTemplate(input: SendPaymentLinkInput): Promise<SendResult> {
  if (!isWhatsAppConfigured()) {
    logger.warn("[whatsapp] ACCESS_TOKEN/PHONE_NUMBER_ID/TEMPLATE_NAME not configured — message not sent");
    return { ok: false, error: "WHATSAPP_NOT_CONFIGURED" };
  }
  const to = normalizePhone(input.to);
  if (!to) return { ok: false, error: "EMPTY_PHONE" };

  const url = `${GRAPH_BASE}/${env.WHATSAPP.GRAPH_VERSION}/${env.WHATSAPP.PHONE_NUMBER_ID}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: env.WHATSAPP.TEMPLATE_NAME,
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: (input.clientName || "Client").slice(0, 100) },
            { type: "text", text: formatINR(input.amountPaise) },
            { type: "text", text: (input.description || "Payment").slice(0, 200) },
            { type: "text", text: input.paymentLink },
          ],
        },
      ],
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.WHATSAPP.ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { messages?: { id?: string }[]; error?: { message?: string; code?: number } };
    if (!res.ok) {
      logger.error("[whatsapp] send failed", data);
      return { ok: false, error: `WHATSAPP_ERROR ${data.error?.code || res.status}: ${data.error?.message || "unknown"}` };
    }
    return { ok: true, messageId: data.messages?.[0]?.id };
  } catch (error) {
    logger.error("[whatsapp] send error", error);
    return { ok: false, error: "NETWORK_ERROR" };
  }
}

/**
 * Verify a WhatsApp webhook signature (X-Hub-Signature-256 = HMAC-SHA256 of
 * the raw body with the app secret, hex, prefixed "sha256=").
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = env.WHATSAPP.APP_SECRET;
  if (!secret) return false;
  const expected = `sha256=${crypto.createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  const a = Buffer.from(expected);
  const b = Buffer.from(signature || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
