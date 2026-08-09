import { Router } from "express";
import { authenticate, requirePermission } from "../middleware/auth";
import { validate } from "../utils/asyncHandler";
import { createPaymentSchema } from "../schemas";
import {
  listPayments,
  paymentStats,
  getPayment,
  createPayment,
  createPaymentLink,
  sendPaymentLink,
  resendPaymentLink,
  cancelPayment,
} from "../controllers/paymentController";

const router = Router();

router.get("/", authenticate, requirePermission("payments:view"), listPayments);
router.get("/stats", authenticate, requirePermission("payments:view"), paymentStats);
router.get("/:id", authenticate, requirePermission("payments:view_details"), getPayment);
router.post("/", authenticate, requirePermission("payments:create"), validate(createPaymentSchema), createPayment);
router.post("/:id/link", authenticate, requirePermission("payments:link_create"), createPaymentLink);
router.post("/:id/send", authenticate, requirePermission("payments:send_whatsapp"), sendPaymentLink);
router.post("/:id/resend", authenticate, requirePermission("payments:resend_whatsapp"), resendPaymentLink);
router.post("/:id/cancel", authenticate, requirePermission("payments:cancel"), cancelPayment);

export default router;
