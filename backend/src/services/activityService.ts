import { ActivityLogModel } from "../models/ActivityLog";
import { Request } from "express";
import { logger } from "../utils/logger";

export interface LogActivityInput {
  user?: { _id?: unknown; name?: string; role?: string } | null;
  action: string;
  entity?: string;
  entityId?: unknown;
  description?: string;
  details?: Record<string, unknown>;
  req?: Request;
}

export async function logActivity(input: LogActivityInput): Promise<void> {
  try {
    const ip = input.req?.ip || input.req?.socket?.remoteAddress || "";
    const userAgent = input.req?.headers?.["user-agent"] || "";
    await ActivityLogModel.create({
      user: input.user?._id ?? undefined,
      userName: input.user?.name || "system",
      role: input.user?.role || "",
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      description: input.description,
      details: input.details,
      ip,
      userAgent: String(userAgent).slice(0, 400),
    });
  } catch (error) {
    logger.error("[activity] failed to write log", error);
  }
}
