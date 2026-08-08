import { Router } from "express";
import { authenticate, requirePermission } from "../middleware/auth";
import { payrollSummary } from "../controllers/payrollController";

const router = Router();

router.get("/summary", authenticate, requirePermission("payroll:view"), payrollSummary);

export default router;
