import { Schema, model, models, InferSchemaType } from "mongoose";

const attendanceRecordSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "AdminUser", required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD (local server date)
    clockIn: { type: Date },
    clockOut: { type: Date },
    status: { type: String, enum: ["present", "half_day", "absent"], default: "absent" },
  },
  { timestamps: true }
);

attendanceRecordSchema.index({ user: 1, date: 1 }, { unique: true });

export type AttendanceRecord = InferSchemaType<typeof attendanceRecordSchema>;

export const AttendanceRecordModel =
  models.AttendanceRecord || model("AttendanceRecord", attendanceRecordSchema);
