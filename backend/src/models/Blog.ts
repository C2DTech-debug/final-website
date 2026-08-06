import { Schema, model, models } from "mongoose";

const blogSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    category: { type: String, default: "General", index: true },
    tags: [{ type: String }],
    author: { type: Schema.Types.ObjectId, ref: "AdminUser", index: true },
    authorName: { type: String, default: "Team C2D Tech" },
    status: { type: String, enum: ["draft", "published", "scheduled"], default: "draft", index: true },
    scheduledAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    readingTime: { type: Number, default: 0 },
    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      keywords: { type: String, default: "" },
      ogImage: { type: String, default: "" },
      noindex: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ tags: 1 });

export const BlogModel = models.Blog || model("Blog", blogSchema);
