import { Schema, model, models } from "mongoose";
import { LEAD_STATUS } from "../types";

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: "", trim: true },
    service: { type: String, default: "" },
    budget: { type: String, default: "" },
    timeline: { type: String, default: "" },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: LEAD_STATUS, default: "new", index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "AdminUser", default: null },
    replies: [
      {
        body: { type: String, required: true },
        by: { type: Schema.Types.ObjectId, ref: "AdminUser" },
        byName: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

contactMessageSchema.index({ createdAt: -1 });

export const ContactMessageModel = models.ContactMessage || model("ContactMessage", contactMessageSchema);
