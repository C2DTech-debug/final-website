import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  const mongoose = require("mongoose");
  if (err instanceof mongoose.Error.ValidationError) {
    const validationErr = err as unknown as { errors: Record<string, { message: string }> };
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: Object.values(validationErr.errors)
          .map((e) => e.message)
          .join("; "),
      },
    });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_ID", message: "Invalid resource identifier" },
    });
  }
  // duplicate key
  if (err && typeof err === "object" && (err as { code?: number }).code === 11000) {
    return res.status(409).json({
      success: false,
      error: { code: "DUPLICATE", message: "A record with that value already exists" },
    });
  }
  if (err && typeof err === "object" && (err as { name?: string }).name === "MulterError") {
    return res.status(400).json({
      success: false,
      error: { code: "UPLOAD_ERROR", message: (err as Error).message },
    });
  }

  let errorMeta: string;
  if (err instanceof Error) {
    errorMeta = err.stack || `${err.name}: ${err.message}`;
  } else {
    try {
      errorMeta = JSON.stringify(err);
    } catch {
      errorMeta = String(err);
    }
  }
  logger.error(errorMeta);
  const message = env.isProduction ? "Internal server error" : err instanceof Error ? err.message : String(err);
  res.status(500).json({ success: false, error: { code: "INTERNAL", message } });
}
