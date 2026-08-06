import { Schema, model, models } from "mongoose";

const permissionSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    label: { type: String, default: "" },
    description: { type: String, default: "" },
    module: { type: String, default: "" },
    action: { type: String, default: "" },
    group: { type: String, default: "" },
  },
  { timestamps: true }
);

export const PermissionModel = models.Permission || model("Permission", permissionSchema);
