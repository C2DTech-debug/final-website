import { Schema, model, models } from "mongoose";

const estimateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: "" },
    services: [{ type: String }], // service slugs selected
    serviceNames: [{ type: String }],
    addons: [{ type: String }],
    features: { type: Schema.Types.Mixed, default: {} }, // per-service selected features
    totalCost: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    timeline: { type: String, default: "" },
    timelineDays: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    status: { type: String, enum: ["new", "contacted", "quoted", "won", "lost"], default: "new", index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "AdminUser", default: null },
    ip: { type: String, default: "" },
  },
  { timestamps: true }
);

estimateSchema.index({ createdAt: -1 });

export const ProjectEstimateModel = models.ProjectEstimate || model("ProjectEstimate", estimateSchema);
