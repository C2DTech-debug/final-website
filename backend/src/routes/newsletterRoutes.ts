import { Router } from "express";
import { strictLimiter } from "../middleware/rateLimit";
import { validate } from "../utils/asyncHandler";
import { newsletterSchema } from "../schemas";
import { subscribe, unsubscribe } from "../controllers/newsletterController";

const router = Router();

router.post("/subscribe", strictLimiter, validate(newsletterSchema), subscribe);
router.get("/unsubscribe/:email", unsubscribe);

export default router;
