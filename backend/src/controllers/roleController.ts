import { Request, Response } from "express";
import { RoleModel } from "../models/Role";
import { PermissionModel } from "../models/Permission";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { logActivity } from "../services/activityService";
import { invalidateRoleCache } from "../services/permissionService";

export const listRoles = asyncHandler(async (_req: Request, res: Response) => {
  const roles = await RoleModel.find().sort({ level: -1 }).lean();
  res.status(200).json({ success: true, data: roles });
});

export const getRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await RoleModel.findById(req.params.id).lean();
  if (!role) throw ApiError.notFound("Role not found");
  res.status(200).json({ success: true, data: role });
});

export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const existing = await RoleModel.findOne({ name: req.body.name });
  if (existing) throw ApiError.conflict("A role with this name already exists");
  const role = await RoleModel.create({ ...req.body, system: false });
  await logActivity({ user: req.user, action: "create", entity: "role", entityId: role._id, description: `Created role "${role.label}"`, req });
  res.status(201).json({ success: true, data: role });
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await RoleModel.findById(req.params.id);
  if (!role) throw ApiError.notFound("Role not found");
  const body = req.body;
  if (body.name && body.name !== role.name) {
    const dup = await RoleModel.findOne({ name: body.name, _id: { $ne: role._id } });
    if (dup) throw ApiError.conflict("A role with this name already exists");
  }
  Object.assign(role, body);
  await role.save();
  invalidateRoleCache(role.name);
  await logActivity({ user: req.user, action: "update", entity: "role", entityId: req.params.id, description: `Updated role "${role.label}"`, req });
  res.status(200).json({ success: true, data: role });
});

export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await RoleModel.findById(req.params.id);
  if (!role) throw ApiError.notFound("Role not found");
  if (role.system) throw ApiError.forbidden("System roles cannot be deleted");
  await role.deleteOne();
  await logActivity({ user: req.user, action: "delete", entity: "role", entityId: req.params.id, description: `Deleted role "${role.label}"`, req });
  res.status(200).json({ success: true, data: { message: "Role deleted" } });
});

export const listPermissions = asyncHandler(async (_req: Request, res: Response) => {
  const permissions = await PermissionModel.find().sort({ module: 1, action: 1 }).lean();
  const grouped: Record<string, typeof permissions> = {};
  for (const p of permissions) {
    const g = p.group || p.module || "Other";
    (grouped[g] ??= []).push(p);
  }
  res.status(200).json({ success: true, data: permissions, meta: { grouped } });
});

export const upsertPermission = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  const permission = await PermissionModel.findOneAndUpdate(
    { name: body.name },
    { $set: body },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  await logActivity({ user: req.user, action: "update", entity: "permission", entityId: permission._id, description: `Upserted permission "${permission.name}"`, req });
  res.status(200).json({ success: true, data: permission });
});
