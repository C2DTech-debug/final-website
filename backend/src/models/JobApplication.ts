import { Schema, model, models } from "mongoose";

const jobApplicationSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    resumeName: { type: String, default: "" },
    coverLetter: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    expectedSalary: { type: String, default: "" },
    status: { type: String, enum: ["new", "under_review", "interview", "offered", "hired", "rejected"], default: "new", index: true },
    notes: { type: String, default: "" },
    ip: { type: String, default: "" },
  },
  { timestamps: true }
);

jobApplicationSchema.index({ status: 1, createdAt: -1 });

export const JobApplicationModel = models.JobApplication || model("JobApplication", jobApplicationSchema);
