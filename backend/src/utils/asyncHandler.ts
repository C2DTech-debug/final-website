import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "./ApiError";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const asyncHandler = (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const source =
      (req.body && Object.keys(req.body).length) || req.method === "POST" || req.method === "PUT" || req.method === "PATCH"
        ? req.body
        : req.query;
    const result = schema.safeParse(source);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      return next(ApiError.badRequest("Validation failed", details));
    }
    (req as Request & { validated: T }).validated = result.data;
    next();
  };
}
