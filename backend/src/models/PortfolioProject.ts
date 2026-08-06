import { Schema, model, models } from "mongoose";

const portfolioSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    gallery: [{ type: String }],
    liveUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    technologies: [{ type: String }],
    category: { type: String, default: "Web Development", index: true },
    client: { type: String, default: "" },
    year: { type: String, default: "" },
    role: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published", "hidden"], default: "published", index: true },
    tags: [{ type: String }],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

portfolioSchema.index({ createdAt: -1 });
portfolioSchema.index({ status: 1, featured: -1 });

export const PortfolioProjectModel = models.PortfolioProject || model("PortfolioProject", portfolioSchema);
