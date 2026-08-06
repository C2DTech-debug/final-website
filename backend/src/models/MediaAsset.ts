import { Schema, model, models } from "mongoose";

const mediaAssetSchema = new Schema(
  {
    name: { type: String, required: true },
    originalName: { type: String, default: "" },
    url: { type: String, required: true },
    publicId: { type: String, default: "" }, // Cloudinary public_id (or local path)
    provider: { type: String, enum: ["cloudinary", "local"], default: "local" },
    mimeType: { type: String, default: "" },
    type: { type: String, enum: ["image", "video", "pdf", "icon", "other"], default: "image" },
    size: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    thumbUrl: { type: String, default: "" }, // generated thumbnail / webp
    uploadedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

mediaAssetSchema.index({ createdAt: -1 });

export const MediaAssetModel = models.MediaAsset || model("MediaAsset", mediaAssetSchema);
