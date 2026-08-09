import { Schema, model, models } from "mongoose";

/**
 * Payment request lifecycle. `paid` is only ever set from a verified
 * Razorpay webhook (payment.captured / payment_link.paid) — never from a
 * client call. Amounts are stored as integer paise (server-authoritative);
 * the frontend may never dictate a final amount.
 */
export const PAYMENT_STATUSES = [
  "created",
  "link_created",
  "sent",
  "paid",
  "failed",
  "expired",
  "cancelled",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const timelineEntrySchema = new Schema(
  {
    action: { type: String, default: "" },
    description: { type: String, default: "" },
    by: { type: Schema.Types.ObjectId, ref: "AdminUser", default: null },
    byName: { type: String, default: "System" },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const paymentSchema = new Schema(
  {
    paymentRef: { type: String, unique: true, index: true },
    lead: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },

    // Snapshot of the client at request time — never mutated after creation.
    leadSnapshot: {
      leadId: { type: String, default: "" },
      name: { type: String, default: "" },
      company: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
    },

    amountPaise: { type: Number, required: true, min: 100 },
    currency: { type: String, default: "INR", uppercase: true, maxlength: 3 },
    description: { type: String, default: "" },

    // Admin checkbox confirming the client agreed to the amount/link.
    clientApproved: { type: Boolean, default: false },
    approvedBy: { type: Schema.Types.ObjectId, ref: "AdminUser", default: null },
    approvedAt: { type: Date, default: null },

    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser", default: null },

    status: { type: String, enum: PAYMENT_STATUSES, default: "created", index: true },

    razorpay: {
      linkId: { type: String, default: "" },
      shortUrl: { type: String, default: "" },
      entityId: { type: String, default: "" },
      orderId: { type: String, default: "" },
    },

    whatsapp: {
      messageId: { type: String, default: "" },
      status: { type: String, default: "" }, // sent / delivered / read / failed
      sentTo: { type: String, default: "" },
      error: { type: String, default: "" },
    },

    payment: {
      razorpayPaymentId: { type: String, default: "" },
      amountPaidPaise: { type: Number, default: 0 },
      method: { type: String, default: "" },
      paidAt: { type: Date, default: null },
      webhookEvent: { type: String, default: "" },
      note: { type: String, default: "" },
    },

    timeline: [timelineEntrySchema],
    source: { type: String, default: "admin" },
  },
  { timestamps: true }
);

paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ lead: 1, status: 1 });
paymentSchema.index({ "whatsapp.messageId": 1 });

// Auto-generate sequential references (C2D-PAY-YYYYMMDD-NNNN)
paymentSchema.pre("save", async function (next) {
  if (!this.paymentRef) {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const prefix = `C2D-PAY-${dateStr}-`;
    const last = (await (this.constructor as unknown as {
      findOne: (f: Record<string, unknown>) => { sort: (s: Record<string, unknown>) => { select: (s: string) => { lean: () => Promise<{ paymentRef: string } | null> } } };
    }).findOne({ paymentRef: { $regex: `^${prefix}` } }).sort({ paymentRef: -1 }).select("paymentRef").lean()) as { paymentRef: string } | null;
    let seq = 1;
    if (last) {
      const parsed = Number.parseInt(last.paymentRef.slice(prefix.length), 10);
      if (Number.isFinite(parsed)) seq = parsed + 1;
    }
    this.paymentRef = `${prefix}${String(seq).padStart(4, "0")}`;
  }
  next();
});

export const PaymentModel = models.Payment || model("Payment", paymentSchema);
