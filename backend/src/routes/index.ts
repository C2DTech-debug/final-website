import { Router } from "express";
import { env } from "../config/env";
import authRoutes from "./authRoutes";
import publicRoutes from "./publicRoutes";
import contactRoutes from "./contactRoutes";
import newsletterRoutes from "./newsletterRoutes";
import estimatorRoutes from "./estimatorRoutes";
import adminRoutes from "./adminRoutes";
import mediaRoutes from "./mediaRoutes";
import exportRoutes from "./exportRoutes";
import analyticsRoutes, { trackVisit } from "./analyticsRoutes";
import taskRoutes from "./taskRoutes";
import attendanceRoutes from "./attendanceRoutes";
import payrollRoutes from "./payrollRoutes";
import paymentRoutes from "./paymentRoutes";
import agreementRoutes, { publicAgreementRouter } from "./agreementRoutes";
import { standardLimiter, strictLimiter } from "../middleware/rateLimit";

const router = Router();

// health check (unauthenticated, no DB requirement)
router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      service: "c2d-tech-api",
      version: "1.0.0",
      time: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  });
});

router.use("/public", publicRoutes);
router.use("/public/agreements", publicAgreementRouter);
router.use("/analytics/visit", standardLimiter, trackVisit);
router.use("/contact", contactRoutes);
router.use("/newsletter", newsletterRoutes);
router.use("/estimator", estimatorRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/admin/media", mediaRoutes);
router.use("/admin/export", exportRoutes);
router.use("/admin/tasks", taskRoutes);
router.use("/admin/attendance", attendanceRoutes);
router.use("/admin/payroll", payrollRoutes);
router.use("/admin/payments", paymentRoutes);
router.use("/admin/agreements", agreementRoutes);

export default router;

