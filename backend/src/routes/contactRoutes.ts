import { Router } from "express";
import { strictLimiter } from "../middleware/rateLimit";
import { validate } from "../utils/asyncHandler";
import { contactFormSchema } from "../schemas";
import { submitContact } from "../controllers/contactController";

const router = Router();

router.post("/", strictLimiter, validate(contactFormSchema), submitContact);

export default router;
