import { Router } from "express";
import { authenticate, requirePermission } from "../middleware/auth";
import { validate } from "../utils/asyncHandler";
import { standardLimiter, strictLimiter } from "../middleware/rateLimit";
import {
  createAgreementSchema,
  updateAgreementSchema,
  clientSignAgreementSchema,
} from "../schemas";
import {
  listAgreements,
  agreementStats,
  getAgreement,
  createAgreement,
  updateAgreement,
  deleteAgreement,
  generateSigningLink,
  createNewVersion,
  cancelAgreement,
  downloadAgreementPdf,
  getPublicAgreement,
  signPublicAgreement,
  downloadPublicAgreementPdf,
} from "../controllers/agreementController";

const router = Router();

// ============================================================================
// ADMIN ROUTES
// ============================================================================

router.get("/", authenticate, requirePermission("agreements:view"), listAgreements);
router.get("/stats", authenticate, requirePermission("agreements:view"), agreementStats);
router.get("/:id", authenticate, requirePermission("agreements:view"), getAgreement);
router.post(
  "/",
  authenticate,
  requirePermission("agreements:create"),
  validate(createAgreementSchema),
  createAgreement
);
router.put(
  "/:id",
  authenticate,
  requirePermission("agreements:update"),
  validate(updateAgreementSchema),
  updateAgreement
);
router.delete("/:id", authenticate, requirePermission("agreements:delete"), deleteAgreement);
router.post(
  "/:id/generate-link",
  authenticate,
  requirePermission("agreements:sign_link"),
  generateSigningLink
);
router.post("/:id/version", authenticate, requirePermission("agreements:create"), createNewVersion);
router.post("/:id/cancel", authenticate, requirePermission("agreements:update"), cancelAgreement);
router.get("/:id/pdf", authenticate, requirePermission("agreements:download"), downloadAgreementPdf);

export default router;

// ============================================================================
// PUBLIC CLIENT ROUTES
// ============================================================================

export const publicAgreementRouter = Router();

publicAgreementRouter.get("/:token", standardLimiter, getPublicAgreement);
publicAgreementRouter.post(
  "/:token/sign",
  strictLimiter,
  validate(clientSignAgreementSchema),
  signPublicAgreement
);
publicAgreementRouter.get("/:token/pdf", standardLimiter, downloadPublicAgreementPdf);
