import { Schema, model, models } from "mongoose";

export const LEAD_SOURCES = [
  "contact_form",
  "estimator",
  "manual",
  "import",
  "website_chat",
  "whatsapp",
  "phone_call",
  "email",
  "facebook_ads",
  "google_ads",
  "referral",
  "walk_in",
  "api",
] as const;

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal_sent",
  "negotiation",
  "follow_up",
  "won",
  "lost",
  "on_hold",
] as const;

export const LEAD_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

const timelineEntrySchema = new Schema(
  {
    action: { type: String, default: "" },
    description: { type: String, default: "" },
    by: { type: Schema.Types.ObjectId, ref: "AdminUser", default: null },
    byName: { type: String, default: "System" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const attachmentSchema = new Schema(
  {
    name: { type: String, default: "" },
    url: { type: String, default: "" },
    size: { type: Number, default: 0 },
    mime: { type: String, default: "" },
  },
  { _id: false }
);

const leadSchema = new Schema(
  {
    leadId: { type: String, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    company: { type: String, default: "" },
    email: { type: String, trim: true, lowercase: true, index: true },
    phone: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "India" },
    businessType: { type: String, default: "" },
    website: { type: String, default: "" },
    service: { type: String, default: "" },
    budget: { type: String, default: "" },
    currency: { type: String, default: "INR" },
    priority: { type: String, enum: LEAD_PRIORITIES, default: "medium", index: true },
    source: { type: String, enum: LEAD_SOURCES, default: "manual", index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "AdminUser", default: null, index: true },
    status: { type: String, enum: LEAD_STATUSES, default: "new", index: true },
    expectedClosingDate: { type: Date, default: null },
    followUpDate: { type: Date, default: null, index: true },
    lastContactedAt: { type: Date, default: null },
    tags: [{ type: String, index: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser", default: null },
    attachments: [attachmentSchema],
    timeline: [timelineEntrySchema],
    referrer: { type: String, default: "" },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

leadSchema.index({ status: 1, source: 1 });
leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ followUpDate: 1 });
leadSchema.index({ email: 1, phone: 1 });

// Auto-generate sequential lead IDs (LD-0001)
leadSchema.pre("save", async function (next) {
  if (!this.leadId) {
    const count = await (this.constructor as unknown as { countDocuments: (f: Record<string, unknown>) => Promise<number> }).countDocuments({});
    this.leadId = `LD-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

export const LeadModel = models.Lead || model("Lead", leadSchema);
