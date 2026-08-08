import { Router } from "express";
import { authenticate, requirePermission } from "../middleware/auth";
import {
  myAttendance,
  myToday,
  listAttendance,
  teamToday,
} from "../controllers/attendanceController";

const router = Router();

router.get("/my", authenticate, requirePermission("attendance:view"), myAttendance);
router.get("/my/today", authenticate, requirePermission("attendance:view"), myToday);
router.get("/today", authenticate, requirePermission("attendance:view_all"), teamToday);
router.get("/", authenticate, requirePermission("attendance:view_all"), listAttendance);

export default router;
