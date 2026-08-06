import { Schema, model, models } from "mongoose";

const seoSettingsSchema = new Schema(
  {
    page: { type: String, required: true, unique: true, index: true }, // home | services | about | contact | global
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    keywords: { type: String, default: "" },
    ogTitle: { type: String, default: "" },
    ogDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    ogType: { type: String, default: "website" },
    twitterTitle: { type: String, default: "" },
    twitterDescription: { type: String, default: "" },
    twitterImage: { type: String, default: "" },
    twitterCard: { type: String, default: "summary_large_image" },
    canonical: { type: String, default: "" },
    noindex: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

export const SEOSettingModel = models.SEOSetting || model("SEOSetting", seoSettingsSchema);
