import { Schema, model, models } from "mongoose";

const jobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    department: { type: String, default: "Engineering" },
    location: { type: String, default: "Trichy, Tamil Nadu (Remote friendly)" },
    type: { type: String, enum: ["full_time", "part_time", "contract", "internship", "remote"], default: "full_time" },
    experience: { type: String, default: "" },
    salary: { type: String, default: "" },
    description: { type: String, default: "" },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    benefits: [{ type: String }],
    status: { type: String, enum: ["draft", "open", "closed"], default: "open", index: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    applicationEmail: { type: String, default: "" },
    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

jobSchema.index({ status: 1, featured: -1, order: 1 });

export const JobModel = models.Job || model("Job", jobSchema);
