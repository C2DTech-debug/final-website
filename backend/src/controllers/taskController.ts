import { Request, Response } from "express";
import { Types } from "mongoose";
import { TaskModel } from "../models/Task";
import { AdminUserModel } from "../models/AdminUser";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { logActivity } from "../services/activityService";
import { getEffectivePermissions } from "../services/permissionService";

const TASK_STATUSES = ["pending", "in_progress", "submitted", "completed", "rejected"] as const;

type TaskDoc = Record<string, any>;

function publicTask(t: TaskDoc) {
  return t;
}

export const listMyTasks = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const query: Record<string, unknown> = { assignedTo: req.user!._id };
  if (typeof status === "string" && (TASK_STATUSES as readonly string[]).includes(status)) query.status = status;
  const tasks = (await TaskModel.find(query).sort({ createdAt: -1 }).lean()) as unknown as TaskDoc[];
  res.status(200).json({ success: true, data: tasks.map(publicTask) });
});

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const { status, assignedTo, search } = req.query;
  const query: Record<string, unknown> = {};
  if (typeof status === "string" && (TASK_STATUSES as readonly string[]).includes(status)) query.status = status;
  if (typeof assignedTo === "string" && Types.ObjectId.isValid(assignedTo)) query.assignedTo = assignedTo;
  if (typeof search === "string" && search.trim()) {
    query.title = { $regex: search.trim(), $options: "i" };
  }
  const tasks = (await TaskModel.find(query).sort({ createdAt: -1 }).lean()) as unknown as TaskDoc[];
  const userIds = Array.from(new Set(tasks.map((t) => String(t.assignedTo)).filter(Boolean)));
  const users = (await AdminUserModel.find({ _id: { $in: userIds } }).select("name email role").lean()) as unknown as { _id: unknown; name: string; email: string; role: string }[];
  const userMap = new Map(users.map((u) => [String(u._id), u]));
  res.status(200).json({
    success: true,
    data: tasks.map((t) => ({
      ...publicTask(t),
      assignee: t.assignedTo ? userMap.get(String(t.assignedTo)) || null : null,
    })),
  });
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const task = (await TaskModel.findById(req.params.id).lean()) as unknown as TaskDoc | null;
  if (!task) throw ApiError.notFound("Task not found");
  const isAssignee = task.assignedTo && String(task.assignedTo) === req.user!._id;
  if (!isAssignee) {
    const perms = await getEffectivePermissions(req.user!.role);
    if (!perms.includes("tasks:view_all") && req.user!.role !== "super_admin") {
      throw ApiError.forbidden("Insufficient permissions");
    }
  }
  res.status(200).json({ success: true, data: publicTask(task) });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, priority, points, assignedTo, dueDate } = req.body;
  if (!title || !assignedTo) throw ApiError.badRequest("Title and assignedTo are required");
  const assignee = (await AdminUserModel.findById(assignedTo).lean()) as unknown as { name: string } | null;
  if (!assignee) throw ApiError.notFound("Assignee not found");
  const task = await TaskModel.create({
    title,
    description: description ?? "",
    priority: priority ?? "medium",
    points: Math.max(0, Number(points) || 0),
    assignedTo,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    createdBy: req.user!._id,
  });
  await logActivity({ user: req.user, action: "create_task", entity: "task", entityId: task._id, description: `Created task "${task.title}" for ${assignee.name}`, req });
  res.status(201).json({ success: true, data: publicTask(task.toObject()) });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await TaskModel.findById(req.params.id);
  if (!task) throw ApiError.notFound("Task not found");
  if (task.status === "completed") throw ApiError.badRequest("Completed tasks cannot be edited");

  const { title, description, priority, points, assignedTo, dueDate, status } = req.body;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (priority !== undefined) task.priority = priority;
  if (points !== undefined) task.points = Math.max(0, Number(points) || 0);
  if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
  if (status !== undefined && (TASK_STATUSES as readonly string[]).includes(status) && status !== "submitted") {
    task.status = status;
  }
  if (assignedTo !== undefined) {
    const assignee = await AdminUserModel.findById(assignedTo);
    if (!assignee) throw ApiError.notFound("Assignee not found");
    task.assignedTo = assignedTo;
  }
  await task.save();
  await logActivity({ user: req.user, action: "update_task", entity: "task", entityId: task._id, description: `Updated task "${task.title}"`, req });
  res.status(200).json({ success: true, data: publicTask(task.toObject()) });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await TaskModel.findById(req.params.id);
  if (!task) throw ApiError.notFound("Task not found");
  if (task.status === "completed") throw ApiError.badRequest("Completed tasks cannot be deleted");
  await task.deleteOne();
  await logActivity({ user: req.user, action: "delete_task", entity: "task", entityId: req.params.id, description: `Deleted task "${task.title}"`, req });
  res.status(200).json({ success: true, data: { message: "Task deleted" } });
});

export const submitTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await TaskModel.findById(req.params.id);
  if (!task) throw ApiError.notFound("Task not found");
  const isAssignee = task.assignedTo && String(task.assignedTo) === req.user!._id;
  if (!isAssignee && req.user!.role !== "super_admin") throw ApiError.forbidden("Only the assignee can submit this task");
  if (task.status === "completed") throw ApiError.badRequest("Task already completed");

  const { submissionNote, submissionUrl } = req.body;
  task.submissionNote = submissionNote ?? "";
  task.submissionUrl = submissionUrl ?? "";
  task.status = "submitted";
  task.submittedAt = new Date();
  task.rejectedAt = undefined;
  task.rejectionReason = "";
  await task.save();
  await logActivity({ user: req.user, action: "submit_task", entity: "task", entityId: task._id, description: `Submitted task "${task.title}"`, req });
  res.status(200).json({ success: true, data: publicTask(task.toObject()) });
});

export const verifyTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await TaskModel.findById(req.params.id);
  if (!task) throw ApiError.notFound("Task not found");
  if (task.status !== "submitted") throw ApiError.badRequest("Only submitted tasks can be verified");

  const { action, rejectionReason } = req.body; // action: "approve" | "reject"
  if (action === "reject") {
    task.status = "rejected";
    task.rejectedAt = new Date();
    task.rejectionReason = rejectionReason ?? "";
    await task.save();
    await logActivity({ user: req.user, action: "reject_task", entity: "task", entityId: task._id, description: `Rejected task "${task.title}"`, req });
    return res.status(200).json({ success: true, data: publicTask(task.toObject()) });
  }
  if (action !== "approve") throw ApiError.badRequest("action must be approve or reject");

  task.status = "completed";
  task.verifiedAt = new Date();
  task.verifiedBy = req.user!._id;
  await task.save();
  await logActivity({ user: req.user, action: "verify_task", entity: "task", entityId: task._id, description: `Verified task "${task.title}" (+${task.points} pts)`, req });
  res.status(200).json({ success: true, data: publicTask(task.toObject()) });
});

export const myTaskStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const [pending, inProgress, submitted, completed, rejected] = await Promise.all([
    TaskModel.countDocuments({ assignedTo: userId, status: "pending" }),
    TaskModel.countDocuments({ assignedTo: userId, status: "in_progress" }),
    TaskModel.countDocuments({ assignedTo: userId, status: "submitted" }),
    TaskModel.countDocuments({ assignedTo: userId, status: "completed" }),
    TaskModel.countDocuments({ assignedTo: userId, status: "rejected" }),
  ]);
  const earned = await TaskModel.aggregate([
    { $match: { assignedTo: new Types.ObjectId(userId), status: "completed" } },
    { $group: { _id: null, total: { $sum: "$points" } } },
  ]);
  res.status(200).json({
    success: true,
    data: { pending, inProgress, submitted, completed, rejected, totalEarned: earned[0]?.total ?? 0 },
  });
});
