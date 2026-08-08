import { Request, Response } from "express";
import { Types } from "mongoose";
import { AttendanceRecordModel } from "../models/AttendanceRecord";
import { AdminUserModel } from "../models/AdminUser";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { getAttendanceSummary, todayStr } from "../services/attendanceService";

export const myAttendance = asyncHandler(async (req: Request, res: Response) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  if (month < 1 || month > 12) throw ApiError.badRequest("Invalid month");
  const records = await getAttendanceSummary(req.user!._id, year, month);
  res.status(200).json({ success: true, data: records });
});

export const listAttendance = asyncHandler(async (req: Request, res: Response) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  if (month < 1 || month > 12) throw ApiError.badRequest("Invalid month");
  const prefix = `${year}-${String(month).padStart(2, "0")}`;

  const [records, users] = await Promise.all([
    AttendanceRecordModel.find({ date: { $regex: `^${prefix}` } }).sort({ date: 1 }).lean(),
    AdminUserModel.find({ isActive: true }).select("name email role").sort({ name: 1 }).lean(),
  ]);

  const byUser: Record<string, { present: number; halfDay: number; absent: number; totalSeconds: number; records: typeof records }> = {};
  for (const u of users) byUser[String(u._id)] = { present: 0, halfDay: 0, absent: 0, totalSeconds: 0, records: [] };

  for (const r of records) {
    const key = String(r.user);
    const entry = byUser[key];
    if (!entry) continue;
    entry.records.push(r);
    if (r.status === "present") entry.present += 1;
    else if (r.status === "half_day") entry.halfDay += 1;
    else entry.absent += 1;
    if (r.clockIn && r.clockOut) {
      entry.totalSeconds += Math.max(0, Math.floor((new Date(r.clockOut).getTime() - new Date(r.clockIn).getTime()) / 1000));
    }
  }

  res.status(200).json({
    success: true,
    data: users.map((u) => ({
      user: { _id: u._id, name: u.name, email: u.email, role: u.role },
      ...byUser[String(u._id)],
      records: byUser[String(u._id)].records,
    })),
  });
});

export const myToday = asyncHandler(async (req: Request, res: Response) => {
  const rec = await AttendanceRecordModel.findOne({ user: req.user!._id, date: todayStr() }).lean();
  res.status(200).json({ success: true, data: rec || null });
});

export const teamToday = asyncHandler(async (req: Request, res: Response) => {
  const [records, users] = await Promise.all([
    AttendanceRecordModel.find({ date: todayStr() }).lean(),
    AdminUserModel.find({ isActive: true }).select("name email role avatar").sort({ name: 1 }).lean(),
  ]);
  const recByUser = new Map(records.map((r) => [String(r.user), r]));
  res.status(200).json({
    success: true,
    data: users.map((u) => ({
      user: { _id: u._id, name: u.name, email: u.email, role: u.role, avatar: u.avatar },
      record: recByUser.get(String(u._id)) || null,
    })),
  });
});
