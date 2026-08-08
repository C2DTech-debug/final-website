import { Request, Response } from "express";
import { TaskModel } from "../models/Task";
import { AttendanceRecordModel } from "../models/AttendanceRecord";
import { AdminUserModel } from "../models/AdminUser";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const payrollSummary = asyncHandler(async (req: Request, res: Response) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  if (month < 1 || month > 12) throw ApiError.badRequest("Invalid month");
  const prefix = `${year}-${String(month).padStart(2, "0")}`;

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const [users, completedTasks, attendance] = await Promise.all([
    AdminUserModel.find({ isActive: true }).select("name email role").sort({ name: 1 }).lean(),
    TaskModel.aggregate([
      { $match: { status: "completed", verifiedAt: { $gte: start, $lt: end } } },
      { $group: { _id: "$assignedTo", tasksCompleted: { $sum: 1 }, points: { $sum: "$points" } } },
    ]),
    AttendanceRecordModel.aggregate([
      { $match: { date: { $regex: `^${prefix}` } } },
      { $group: { _id: "$user", presentDays: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } }, halfDays: { $sum: { $cond: [{ $eq: ["$status", "half_day"] }, 1, 0] } } } },
    ]),
  ]);

  const pointsMap = new Map(completedTasks.map((t) => [String(t._id), t]));
  const attendanceMap = new Map(attendance.map((a) => [String(a._id), a]));

  res.status(200).json({
    success: true,
    data: {
      year,
      month,
      rows: users.map((u) => ({
        user: { _id: u._id, name: u.name, email: u.email, role: u.role },
        points: pointsMap.get(String(u._id))?.points ?? 0,
        tasksCompleted: pointsMap.get(String(u._id))?.tasksCompleted ?? 0,
        presentDays: attendanceMap.get(String(u._id))?.presentDays ?? 0,
        halfDays: attendanceMap.get(String(u._id))?.halfDays ?? 0,
      })),
    },
  });
});
