import { Schema, model, models } from "mongoose";

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "AdminUser", default: null, index: true },
    type: {
      type: String,
      enum: ["contact", "lead", "estimate", "blog", "career", "system", "login", "error", "payment"],
      default: "system",
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, default: "" },
    link: { type: String, default: "" },
    entityType: { type: String, default: "" },
    entityId: { type: String, default: "" },
    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ read: 1, createdAt: -1 });

export const NotificationModel = models.Notification || model("Notification", notificationSchema);
