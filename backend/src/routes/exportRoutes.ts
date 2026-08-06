import { Router } from "express";
import { authenticate, isManagerOrAbove } from "../middleware/auth";
import { exportCsv, exportExcel, exportPdf } from "../controllers/exportController";

const router = Router();

router.get("/:type/csv", authenticate, isManagerOrAbove, exportCsv);
router.get("/:type/excel", authenticate, isManagerOrAbove, exportExcel);
router.get("/:type/pdf", authenticate, isManagerOrAbove, exportPdf);

export default router;
