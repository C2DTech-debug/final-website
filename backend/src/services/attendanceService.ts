import { AttendanceRecordModel } from "../models/AttendanceRecord";
import { AdminUserModel } from "../models/AdminUser";

export function todayStr(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Marks the user as clocked-in for today (idempotent; keeps earliest clockIn).
 *  If the user already clocked out for the day, the record is left untouched. */
export async function clockIn(userId: string): Promise<void> {
  const date = todayStr();
  await AttendanceRecordModel.updateOne(
    { user: userId, date, clockOut: { $exists: false } },
    {
      $setOnInsert: { user: userId, date, clockIn: new Date(), status: "present" },
      $set: { status: "present" },
    },
    { upsert: true }
  );
}

/** Clocks the user out for today if they clocked in (idempotent). */
export async function clockOut(userId: string): Promise<void> {
  const date = todayStr();
  const rec = await AttendanceRecordModel.findOne({ user: userId, date });
  if (!rec || rec.clockOut) return;
  if (!rec.clockIn) {
    // user never clocked in today (e.g. 2FA flow) — treat as present anyway
    rec.clockIn = rec.clockIn || new Date();
  }
  rec.clockOut = new Date();
  rec.status = "present";
  await rec.save();
}

export interface AttendanceSummary {
  date: string;
  clockIn?: Date;
  clockOut?: Date;
  status: string;
  totalSeconds: number;
}

export async function getAttendanceSummary(userId: string, year: number, month: number): Promise<AttendanceSummary[]> {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const records = await AttendanceRecordModel.find({
    user: userId,
    date: { $regex: `^${prefix}` },
  })
    .sort({ date: 1 })
    .lean();

  return records.map((r) => {
    const clockInDate = r.clockIn ? new Date(r.clockIn) : undefined;
    const clockOutDate = r.clockOut ? new Date(r.clockOut) : undefined;
    let totalSeconds = 0;
    if (clockInDate && clockOutDate) {
      totalSeconds = Math.max(0, Math.floor((clockOutDate.getTime() - clockInDate.getTime()) / 1000));
    }
    return {
      date: r.date,
      clockIn: r.clockIn,
      clockOut: r.clockOut,
      status: r.status,
      totalSeconds,
    };
  });
}

export async function getUserDisplay(userId: string): Promise<{ _id: string; name: string; email: string } | null> {
  const u = (await AdminUserModel.findById(userId).select("name email").lean()) as unknown as { _id: string; name: string; email: string } | null;
  return u ? { _id: u._id.toString(), name: u.name, email: u.email } : null;
}
