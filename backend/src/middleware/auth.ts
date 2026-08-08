import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/tokenService";
import { ApiError } from "../utils/ApiError";
import { AdminUserModel } from "../models/AdminUser";
import { getEffectivePermissions } from "../services/permissionService";

export interface AuthUser {
  _id: string;
  id: string;
  email: string;
  role: string;
  name: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || "";
    const headerToken = header.startsWith("Bearer ") ? header.slice(7) : null;
    // Downloads (CSV/Excel/PDF) are triggered by plain link navigation, which
    // cannot set an Authorization header — fall back to the ?token= query param.
    const queryToken = typeof req.query.token === "string" ? req.query.token : null;
    const token = headerToken || queryToken;
    if (!token) throw ApiError.unauthorized("Missing access token");

    const payload = verifyAccessToken(token);
    const user = (await AdminUserModel.findById(payload.sub)
      .select("_id email role name isActive")
      .lean()) as unknown as { _id: string; email: string; role: string; name: string; isActive: boolean } | null;
    if (!user) throw ApiError.unauthorized("User no longer exists");
    if (!user.isActive) throw ApiError.forbidden("Account is disabled");

    req.user = {
      _id: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    return next(ApiError.unauthorized("Invalid or expired token"));
  }
}

/** Require a minimum role level (see ROLE_LEVEL). */
export function requireRole(minLevel: number) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    const { ROLE_LEVEL } = require("../types");
    const level = ROLE_LEVEL[req.user.role as keyof typeof ROLE_LEVEL] ?? 0;
    if (level < minLevel) return next(ApiError.forbidden("Insufficient permissions"));
    next();
  };
}

export const isSuperAdmin = requireRole(5);
export const isAdminOrAbove = requireRole(4);
export const isManagerOrAbove = requireRole(3);
export const isStaffOrAbove = requireRole(1);

/**
 * Require any of the given permissions. The user's role resolves to an
 * effective permission set (built-in map ∪ Role document). `super_admin`
 * always passes. The backend is the final authority — no UI check can bypass.
 */
export function requirePermission(...required: string[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    const perms = await getEffectivePermissions(req.user.role);
    const allowed = perms.some((p) => required.includes(p));
    if (!allowed) return next(ApiError.forbidden("Insufficient permissions"));
    next();
  };
}
