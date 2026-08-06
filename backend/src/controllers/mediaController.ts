import { Request, Response } from "express";
import { MediaAssetModel } from "../models/MediaAsset";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { logActivity } from "../services/activityService";
import { storeFile, deleteStoredFile } from "../services/storageService";

function detectType(mime: string): string {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "pdf";
  return "other";
}

export const uploadMedia = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest("No file uploaded");
  const file = req.file;
  const mime = file.mimetype || "application/octet-stream";
  const type = detectType(mime);

  const stored = await storeFile(file);

  const asset = await MediaAssetModel.create({
    name: file.originalname,
    originalName: file.originalname,
    url: stored.url,
    publicId: stored.publicId,
    provider: stored.provider,
    mimeType: mime,
    type,
    size: file.size,
    uploadedBy: req.user!._id,
  });

  await logActivity({ user: req.user, action: "upload", entity: "media", entityId: asset._id, description: `Uploaded media ${file.originalname}`, req });
  res.status(201).json({ success: true, data: asset });
});

export const listMedia = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const { type, q } = req.query;
  const filter: Record<string, unknown> = {};
  if (type && type !== "all") filter.type = type;
  if (q) filter.originalName = { $regex: q, $options: "i" };
  const total = await MediaAssetModel.countDocuments(filter);
  const data = await MediaAssetModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
  res.status(200).json({ success: true, data, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const deleteMedia = asyncHandler(async (req: Request, res: Response) => {
  const asset = await MediaAssetModel.findById(req.params.id);
  if (!asset) throw ApiError.notFound("Media not found");
  deleteStoredFile(asset.provider, asset.publicId, asset.type, asset.url);
  await MediaAssetModel.findByIdAndDelete(req.params.id);
  await logActivity({ user: req.user, action: "delete", entity: "media", entityId: req.params.id, description: `Deleted media ${asset.originalName}`, req });
  res.status(200).json({ success: true, data: { message: "Media deleted" } });
});
