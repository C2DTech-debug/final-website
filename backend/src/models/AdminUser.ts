import { Schema, model, models, InferSchemaType } from "mongoose";
import bcrypt from "bcryptjs";

const adminUserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, required: true, default: "content_editor", index: true },
    isActive: { type: Boolean, default: true },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },
    // 2FA (TOTP) — generated via otplib. `twoFactorSecret` is encrypted-at-rest placeholder.
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, default: "", select: false },
    passwordChangedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

adminUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = new Date();
  next();
});

adminUserSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export type AdminUser = InferSchemaType<typeof adminUserSchema> & {
  comparePassword(candidate: string): Promise<boolean>;
  role: string;
};

export const AdminUserModel = models.AdminUser || model("AdminUser", adminUserSchema);
