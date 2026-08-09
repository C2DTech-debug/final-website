import crypto from "crypto";
import { env } from "../config/env";
import { logger } from "../utils/logger";

interface RazorpayPaymentLinkClient {
  paymentLink: {
    create(params: Record<string, unknown>): Promise<Record<string, unknown>>;
  };
}

interface CreatePaymentLinkInput {
  amountPaise: number;
  currency: string;
  description: string;
  customer: { name: string; email: string; contact: string };
  notes: Record<string, string>;
}

export const isRazorpayConfigured = (): boolean =>
  Boolean(env.RAZORPAY.KEY_ID && env.RAZORPAY.KEY_SECRET);

let _instance: RazorpayPaymentLinkClient | null = null;
let _attempted = false;

function getInstance(): RazorpayPaymentLinkClient | null {
  if (_attempted) return _instance;
  _attempted = true;
  if (!isRazorpayConfigured()) {
    logger.warn("[razorpay] KEY_ID/KEY_SECRET not configured — payment link creation disabled");
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Razorpay = require("razorpay");
    _instance = new Razorpay({ key_id: env.RAZORPAY.KEY_ID, key_secret: env.RAZORPAY.KEY_SECRET }) as RazorpayPaymentLinkClient;
    return _instance;
  } catch (error) {
    logger.error("[razorpay] failed to initialise SDK", error);
    return null;
  }
}

/** Create a Razorpay payment link. Resolves the link id + short URL. */
export async function createPaymentLink(input: CreatePaymentLinkInput): Promise<{ linkId: string; shortUrl: string; entityId: string }> {
  const client = getInstance();
  if (!client) throw new Error("RAZORPAY_NOT_CONFIGURED");

  let link: Record<string, unknown>;
  try {
    link = await client.paymentLink.create({
      amount: Math.round(input.amountPaise),
      currency: input.currency || "INR",
      accept_partial: false,
      description: input.description.slice(0, 245),
      customer: {
        name: input.customer.name.slice(0, 200),
        email: input.customer.email || undefined,
        contact: input.customer.contact || undefined,
      },
      notify: { email: false, sms: false },
      remind_by: { enable: false },
      notes: input.notes,
      reference_id: `C2D-${Date.now()}`,
      callback_url: undefined,
    });
  } catch (error) {
    // The Razorpay SDK rejects with a plain object (e.g. HTTP 401 auth failure),
    // not an Error instance — unwrap it so callers/logs see the real reason.
    const raw = error as { message?: string; error?: { code?: string; description?: string }; statusCode?: number };
    const description = raw.error?.description || raw.message || "Razorpay API error";
    const status = raw.statusCode ? ` (HTTP ${raw.statusCode})` : "";
    logger.error(`[razorpay] paymentLink.create failed${status}: ${description}`);
    throw new Error(`RAZORPAY_LINK_FAILED: ${description}`);
  }

  return {
    linkId: String(link.id || ""),
    shortUrl: String(link.short_url || link.url || ""),
    entityId: String(link.id || ""),
  };
}

/**
 * Verify a Razorpay webhook signature (HMAC-SHA256 of the raw body with the
 * webhook secret). The raw body must be the untouched request payload.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = env.RAZORPAY.WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
