import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

/** Blocks all public API traffic while maintenance mode is on (admins still pass). */
export function maintenanceMode(req: Request, _res: Response, next: NextFunction) {
  if (!env.MAINTENANCE_MODE) return next();
  if (req.path.startsWith("/admin") || req.path.startsWith("/auth")) return next();
  if (req.headers.authorization) return next();
  next(ApiError.badRequest("Website is under maintenance. Please check back shortly."));
}

export async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!env.RECAPTCHA_SECRET) return true; // not configured -> allow (log on admin setup)
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: env.RECAPTCHA_SECRET, response: token }),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success;
  } catch {
    return false;
  }
}
