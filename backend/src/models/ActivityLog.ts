import { Schema, model, models } from "mongoose";

const activityLogSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    userName: { type: String, default: "" },
    role: { type: String, default: "" },
    action: { type: String, required: true }, // login, logout, create, update, delete, export ...
    entity: { type: String, default: "" }, // service, portfolio, team ...
    entityId: { type: Schema.Types.Mixed, default: null },
    description: { type: String, default: "" },
    details: { type: Schema.Types.Mixed, default: {} },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });

export const ActivityLogModel = models.ActivityLog || model("ActivityLog", activityLogSchema);
