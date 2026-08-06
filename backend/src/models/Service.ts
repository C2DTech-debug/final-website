import { Schema, model, models } from "mongoose";

const seoMetaSchema = new Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    keywords: { type: String, default: "" },
    ogTitle: { type: String, default: "" },
    ogDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    twitterTitle: { type: String, default: "" },
    twitterDescription: { type: String, default: "" },
    twitterImage: { type: String, default: "" },
    canonical: { type: String, default: "" },
    noindex: { type: Boolean, default: false },
  },
  { _id: false }
);

const serviceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    tagline: { type: String, default: "" },
    icon: { type: String, default: "" }, // emoji | lucide name | URL
    image: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    features: [{ type: String }],
    deliverables: [{ type: String }],
    pricing: {
      enabled: { type: Boolean, default: true },
      startingAt: { type: Number, default: 0 },
      currency: { type: String, default: "INR" },
      priceLabel: { type: String, default: "" }, // e.g. "Starting At", "From"
      deliveryDays: { type: Number, default: 0 },
    },
    category: { type: String, default: "general" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    seo: { type: seoMetaSchema, default: {} },
  },
  { timestamps: true }
);

serviceSchema.index({ order: 1, published: 1 });

export const ServiceModel = models.Service || model("Service", serviceSchema);
