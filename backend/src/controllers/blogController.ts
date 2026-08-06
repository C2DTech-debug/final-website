import { Request, Response } from "express";
import { BlogModel } from "../models/Blog";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { logActivity } from "../services/activityService";
import { notify } from "../services/notificationService";

function estimateReadingTime(content: string): number {
  if (!content) return 0;
  const words = content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function statusForCreate(body: { status?: string; scheduledAt?: string }) {
  const status = body.status || "draft";
  if (status === "scheduled" && !body.scheduledAt) {
    return { status: "draft" as const, scheduledAt: null };
  }
  return { status: status as "draft" | "published" | "scheduled", scheduledAt: body.scheduledAt || null };
}

// ---------- Admin ----------

export const listAllBlogs = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const { q, status, category } = req.query;
  const filter: Record<string, unknown> = {};
  if (q) filter.$or = [{ title: { $regex: q, $options: "i" } }, { excerpt: { $regex: q, $options: "i" } }, { tags: { $regex: q, $options: "i" } }];
  if (status) filter.status = status;
  if (category) filter.category = category;

  const total = await BlogModel.countDocuments(filter);
  const data = (await BlogModel.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()) as unknown as Record<string, unknown>[];

  res.status(200).json({ success: true, data, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const getBlogById = asyncHandler(async (req: Request, res: Response) => {
  const doc = await BlogModel.findById(req.params.id).lean();
  if (!doc) throw ApiError.notFound("Blog post not found");
  res.status(200).json({ success: true, data: doc });
});

export const createBlog = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  const { status, scheduledAt } = statusForCreate(body);
  const publishedAt = status === "published" ? new Date() : null;
  const doc = await BlogModel.create({
    ...body,
    author: body.author || req.user!._id,
    authorName: body.authorName || req.user!.name,
    status,
    scheduledAt: scheduledAt || null,
    publishedAt,
    readingTime: body.readingTime || estimateReadingTime(body.content || ""),
  });
  await logActivity({ user: req.user, action: "create", entity: "blog", entityId: doc._id, description: `Created blog "${doc.title}"`, req });
  if (status === "published") {
    await notify({ type: "blog", title: `Blog published: ${doc.title}`, link: `/admin/blogs`, entityType: "blog", entityId: String(doc._id) });
  }
  res.status(201).json({ success: true, data: doc });
});

export const updateBlog = asyncHandler(async (req: Request, res: Response) => {
  const doc = await BlogModel.findById(req.params.id);
  if (!doc) throw ApiError.notFound("Blog post not found");
  const body = req.body;
  const { status, scheduledAt } = statusForCreate(body);
  const wasPublished = doc.status === "published";
  const willPublish = status === "published";

  doc.set(body);
  doc.status = status;
  doc.scheduledAt = scheduledAt || null;
  if (!wasPublished && willPublish) doc.publishedAt = new Date();
  if (body.readingTime === undefined) doc.readingTime = estimateReadingTime(body.content || doc.content || "");
  await doc.save();

  await logActivity({ user: req.user, action: "update", entity: "blog", entityId: req.params.id, description: `Updated blog "${doc.title}"`, req });
  if (!wasPublished && willPublish) {
    await notify({ type: "blog", title: `Blog published: ${doc.title}`, link: `/admin/blogs`, entityType: "blog", entityId: String(doc._id) });
  }
  res.status(200).json({ success: true, data: doc });
});

export const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  const doc = await BlogModel.findByIdAndDelete(req.params.id);
  if (!doc) throw ApiError.notFound("Blog post not found");
  await logActivity({ user: req.user, action: "delete", entity: "blog", entityId: req.params.id, description: `Deleted blog "${doc.title}"`, req });
  res.status(200).json({ success: true, data: { message: "Blog deleted" } });
});

// ---------- Public ----------

export const listPublishedBlogs = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
  const { category, tag, q } = req.query;
  const filter: Record<string, unknown> = { status: "published" };
  if (category && category !== "All") filter.category = category;
  if (tag) filter.tags = tag;
  if (q) filter.$or = [{ title: { $regex: q, $options: "i" } }, { excerpt: { $regex: q, $options: "i" } }, { tags: { $regex: q, $options: "i" } }];

  const total = await BlogModel.countDocuments(filter);
  const data = await BlogModel.find(filter)
    .sort({ publishedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select("-content")
    .lean();
  const categories = await BlogModel.distinct("category", { status: "published" });

  res.status(200).json({ success: true, data, meta: { page, limit, total, pages: Math.ceil(total / limit), categories } });
});

export const getPublishedBlog = asyncHandler(async (req: Request, res: Response) => {
  const doc = (await BlogModel.findOne({ slug: req.params.slug, status: "published" }).lean()) as unknown as
    | (Record<string, unknown> & { _id: unknown; category?: string; tags?: string[] })
    | null;
  if (!doc) throw ApiError.notFound("Blog post not found");

  BlogModel.updateOne({ _id: doc._id }, { $inc: { views: 1 } }).catch(() => undefined);

  const related = (await BlogModel.find({
    status: "published",
    _id: { $ne: doc._id },
    $or: [{ category: doc.category }, { tags: { $in: doc.tags } }],
  })
    .sort({ publishedAt: -1 })
    .limit(3)
    .select("-content")
    .lean()) as unknown as Record<string, unknown>[];

  res.status(200).json({ success: true, data: { ...doc, related } });
});
