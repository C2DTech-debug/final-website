import { Schema, model, models, InferSchemaType } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "in_progress", "submitted", "completed", "rejected"],
      default: "pending",
      index: true,
    },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    points: { type: Number, default: 0, min: 0 },
    assignedTo: { type: Schema.Types.ObjectId, ref: "AdminUser", index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser", index: true },
    dueDate: { type: Date },
    submissionNote: { type: String, default: "" },
    submissionUrl: { type: String, default: "" },
    submittedAt: { type: Date },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    rejectedAt: { type: Date },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });

export type Task = InferSchemaType<typeof taskSchema>;

export const TaskModel = models.Task || model("Task", taskSchema);
