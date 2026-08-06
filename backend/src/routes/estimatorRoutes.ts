import { Router } from "express";
import { strictLimiter } from "../middleware/rateLimit";
import { validate } from "../utils/asyncHandler";
import { estimateSchema } from "../schemas";
import { getEstimateQuote, submitEstimate } from "../controllers/estimatorController";

const router = Router();

router.post("/quote", validate(estimateSchema.omit({ name: true, email: true, phone: true, notes: true, recaptchaToken: true })), getEstimateQuote);
router.post("/submit", strictLimiter, validate(estimateSchema), submitEstimate);

export default router;
