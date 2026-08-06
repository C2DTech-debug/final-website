import { Schema, model, models } from "mongoose";

const leadNoteSchema = new Schema(
  {
    lead: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    body: { type: String, required: true, trim: true },
    by: { type: Schema.Types.ObjectId, ref: "AdminUser", default: null },
    byName: { type: String, default: "System" },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

leadNoteSchema.index({ lead: 1, createdAt: -1 });

export const LeadNoteModel = models.LeadNote || model("LeadNote", leadNoteSchema);
