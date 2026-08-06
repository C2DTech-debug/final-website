import { Schema, model, models } from "mongoose";

const pageVisitSchema = new Schema(
  {
    path: { type: String, default: "/" },
    referrer: { type: String, default: "" },
    device: { type: String, enum: ["desktop", "mobile", "tablet", "unknown"], default: "unknown" },
    browser: { type: String, default: "" },
    country: { type: String, default: "" },
    ipHash: { type: String, default: "" }, // hashed, never raw IP
    session: { type: String, default: "" },
  },
  { timestamps: true }
);

pageVisitSchema.index({ createdAt: -1 });
pageVisitSchema.index({ path: 1, createdAt: 1 });

export const PageVisitModel = models.PageVisit || model("PageVisit", pageVisitSchema);
