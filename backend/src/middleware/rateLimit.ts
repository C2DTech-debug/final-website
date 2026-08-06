import rateLimit from "express-rate-limit";
import { env } from "../config/env";

const standardLimiter = rateLimit({
  windowMs: env.RATE_LIMIT.WINDOW_MS,
  max: env.RATE_LIMIT.MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many requests, please try again later." } },
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // login / public form submissions
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many attempts, please try again later." } },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many login attempts. Try again in 15 minutes." } },
});

export { standardLimiter, strictLimiter, authLimiter };
