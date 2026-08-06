import { Request, Response } from "express";
import { NotificationModel } from "../models/Notification";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { logActivity } from "../services/activityService";

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const { read, type } = req.query;

  const filter: Record<string, unknown> = { $or: [{ user: req.user!._id }, { user: null }] };
  if (read !== undefined) filter.read = read === "true";
  if (type) filter.type = type;

  const total = await NotificationModel.countDocuments(filter);
  const data = await NotificationModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
  const unread = await NotificationModel.countDocuments({ $or: [{ user: req.user!._id }, { user: null }], read: false });

  res.status(200).json({ success: true, data, meta: { page, limit, total, pages: Math.ceil(total / limit), unread } });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const doc = await NotificationModel.findOne({ _id: req.params.id, $or: [{ user: req.user!._id }, { user: null }] });
  if (!doc) throw ApiError.notFound("Notification not found");
  const read = req.body.read !== false;
  doc.read = read;
  doc.readAt = read ? new Date() : null;
  await doc.save();
  res.status(200).json({ success: true, data: doc });
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  await NotificationModel.updateMany(
    { $or: [{ user: req.user!._id }, { user: null }], read: false },
    { $set: { read: true, readAt: new Date() } }
  );
  res.status(200).json({ success: true, data: { message: "All notifications marked as read" } });
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const doc = await NotificationModel.findOneAndDelete({ _id: req.params.id, $or: [{ user: req.user!._id }, { user: null }] });
  if (!doc) throw ApiError.notFound("Notification not found");
  await logActivity({ user: req.user, action: "delete", entity: "notification", entityId: req.params.id, description: "Deleted a notification", req });
  res.status(200).json({ success: true, data: { message: "Notification deleted" } });
});
