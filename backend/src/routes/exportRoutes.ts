import { Router, type NextFunction, type Request, type Response } from "express";
import { authenticate, requirePermission } from "../middleware/auth";
import { exportCsv, exportExcel, exportPdf } from "../controllers/exportController";
import { ApiError } from "../utils/ApiError";
import type { PermissionName } from "../types";

const router = Router();

const EXPORT_PERMISSIONS: Record<string, PermissionName[]> = {
  contacts: ["contacts:view"],
  subscribers: ["content:view"],
  estimates: ["leads:view"],
  leads: ["leads:export", "leads:view"],
  applications: ["content:view"],
};

function requireExportPermission(req: Request, _res: Response, next: NextFunction) {
  const required = EXPORT_PERMISSIONS[req.params.type];
  if (!required) return next(ApiError.notFound("Unknown export type"));
  return requirePermission(...required)(req, _res, next);
}

router.get("/:type/csv", authenticate, requireExportPermission, exportCsv);
router.get("/:type/excel", authenticate, requireExportPermission, exportExcel);
router.get("/:type/pdf", authenticate, requireExportPermission, exportPdf);

export default router;
