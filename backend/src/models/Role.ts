import { Schema, model, models } from "mongoose";

const roleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    label: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    level: { type: Number, default: 1 },
    permissions: [{ type: String }],
    system: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const RoleModel = models.Role || model("Role", roleSchema);
