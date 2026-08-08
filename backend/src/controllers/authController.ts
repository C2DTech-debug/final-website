import { Request, Response } from "express";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { AdminUserModel } from "../models/AdminUser";
import { RefreshTokenModel } from "../models/RefreshToken";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { signAccessToken, signRefreshToken, verifyRefreshToken, generateRefreshTokenId, refreshTokenLifetimeMs } from "../services/tokenService";
import { logActivity } from "../services/activityService";
import { clockIn, clockOut } from "../services/attendanceService";
import { getEffectivePermissions } from "../services/permissionService";
import { ROLE_LABELS } from "../types";

function setRefreshCookie(res: Response, token: string) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: env.COOKIE.SECURE,
    sameSite: env.COOKIE.SAME_SITE,
    maxAge: refreshTokenLifetimeMs(),
    path: "/",
  });
}

const publicUser = (u: Record<string, unknown>) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  avatar: u.avatar,
  phone: u.phone,
  isActive: u.isActive,
  twoFactorEnabled: u.twoFactorEnabled,
  lastLoginAt: u.lastLoginAt,
  createdAt: u.createdAt,
  roleLabel: ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] ?? u.role,
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await AdminUserModel.findOne({ email }).select("+password +twoFactorSecret");
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }
  if (!user.isActive) throw ApiError.forbidden("Account disabled. Contact the administrator.");

  const ip = req.ip || "";
  const userAgent = req.headers["user-agent"] || "";

  // If 2FA enabled, issue a short-lived pending token instead of full access.
  if (user.twoFactorEnabled) {
    const pending = signAccessToken({ _id: user._id.toString(), email: user.email, role: user.role, name: user.name });
    logActivity({ user, action: "login:2fa_pending", description: "2FA challenge started", req });
    return res.status(200).json({ success: true, data: { requiresTwoFactor: true, pendingToken: pending } });
  }

  user.lastLoginAt = new Date();
  user.lastLoginIp = ip;
  await user.save();
  await clockIn(user._id.toString());

  const accessToken = signAccessToken({ _id: user._id.toString(), email: user.email, role: user.role, name: user.name });
  const jti = generateRefreshTokenId();
  const refreshToken = signRefreshToken(user._id.toString(), jti);
  await RefreshTokenModel.create({ user: user._id, token: jti, expiresAt: new Date(Date.now() + refreshTokenLifetimeMs()), userAgent, ip });
  setRefreshCookie(res, refreshToken);

  await logActivity({ user, action: "login", description: "Admin signed in", req });

  const permissions = await getEffectivePermissions(user.role);
  res.status(200).json({ success: true, data: { accessToken, user: { ...publicUser(user.toObject()), permissions } } });
});

export const verifyTwoFactor = asyncHandler(async (req: Request, res: Response) => {
  const code = String(req.body.code || "").replace(/\s/g, "");
  const pendingToken = String(req.body.pendingToken || "");
  if (!pendingToken) throw ApiError.badRequest("Missing pending token");
  if (!/^\d{6}$/.test(code)) throw ApiError.badRequest("2FA code must be 6 digits");

  // decode pending token via same verify fn (returns AccessPayload)
  const { verifyAccessToken } = require("../services/tokenService");
  let payload;
  try {
    payload = verifyAccessToken(pendingToken);
  } catch {
    throw ApiError.unauthorized("Pending token invalid or expired");
  }

  const user = await AdminUserModel.findById(payload.sub).select("+twoFactorSecret");
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) throw ApiError.badRequest("2FA not enabled for this account");

  const valid = authenticator.verify({ token: code, secret: user.twoFactorSecret });
  if (!valid) {
    await logActivity({ user, action: "login:2fa_failed", description: "Invalid 2FA code", req });
    throw ApiError.unauthorized("Invalid authentication code");
  }

  user.lastLoginAt = new Date();
  user.lastLoginIp = req.ip || "";
  await user.save();
  await clockIn(user._id.toString());

  const accessToken = signAccessToken({ _id: user._id.toString(), email: user.email, role: user.role, name: user.name });
  const jti = generateRefreshTokenId();
  const refreshToken = signRefreshToken(user._id.toString(), jti);
  await RefreshTokenModel.create({ user: user._id, token: jti, expiresAt: new Date(Date.now() + refreshTokenLifetimeMs()), userAgent: req.headers["user-agent"] || "", ip: req.ip || "" });
  setRefreshCookie(res, refreshToken);

  await logActivity({ user, action: "login", description: "Admin signed in (2FA verified)", req });
  const permissions = await getEffectivePermissions(user.role);
  res.status(200).json({ success: true, data: { accessToken, user: { ...publicUser(user.toObject()), permissions } } });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = (req.body && req.body.refreshToken) || req.cookies?.refreshToken || "";
  if (!token) throw ApiError.unauthorized("Missing refresh token");

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const stored = await RefreshTokenModel.findOne({ token: payload.jti, revoked: false });
  if (!stored || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized("Refresh token has been revoked or expired");
  }

  const user = await AdminUserModel.findById(payload.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized("User no longer active");

  // rotate refresh token
  stored.revoked = true;
  stored.replacedBy = payload.jti;
  await stored.save();

  const newJti = generateRefreshTokenId();
  const newRefresh = signRefreshToken(user._id.toString(), newJti);
  await RefreshTokenModel.create({ user: user._id, token: newJti, expiresAt: new Date(Date.now() + refreshTokenLifetimeMs()), userAgent: req.headers["user-agent"] || "", ip: req.ip || "" });
  setRefreshCookie(res, newRefresh);

  const accessToken = signAccessToken({ _id: user._id.toString(), email: user.email, role: user.role, name: user.name });
  const permissions = await getEffectivePermissions(user.role);
  res.status(200).json({ success: true, data: { accessToken, user: { ...publicUser(user.toObject()), permissions } } });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const raw = (req.body && req.body.refreshToken) || req.cookies?.refreshToken || "";
  try {
    const payload = raw ? verifyRefreshToken(raw) : null;
    if (payload) {
      await RefreshTokenModel.findOneAndUpdate({ token: payload.jti }, { $set: { revoked: true } });
    }
  } catch {
    // ignore malformed token
  }
  res.clearCookie("refreshToken", { path: "/" });
  if (req.user) await clockOut(req.user._id);
  await logActivity({ user: req.user, action: "logout", description: "Admin signed out", req });
  res.status(200).json({ success: true, data: { message: "Logged out" } });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await AdminUserModel.findById(req.user!._id);
  if (!user) throw ApiError.notFound("User not found");
  const permissions = await getEffectivePermissions(user.role);
  res.status(200).json({ success: true, data: { user: { ...publicUser(user.toObject()), permissions } } });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { currentPassword: string; newPassword: string };
  const user = await AdminUserModel.findById(req.user!._id).select("+password");
  if (!user) throw ApiError.notFound("User not found");
  if (!(await user.comparePassword(body.currentPassword))) throw ApiError.badRequest("Current password is incorrect");
  user.password = body.newPassword;
  await user.save();
  // revoke all refresh tokens
  await RefreshTokenModel.updateMany({ user: user._id }, { $set: { revoked: true } });
  await logActivity({ user, action: "password_change", description: "Password changed", req });
  res.status(200).json({ success: true, data: { message: "Password changed. Please sign in again." } });
});

export const setupTwoFactor = asyncHandler(async (req: Request, res: Response) => {
  const user = await AdminUserModel.findById(req.user!._id).select("+twoFactorSecret");
  if (!user) throw ApiError.notFound("User not found");
  const secret = user.twoFactorSecret || authenticator.generateSecret();
  const otpauth = authenticator.keyuri(user.email, "C2D Tech Admin", secret);
  const qr = await QRCode.toDataURL(otpauth);
  if (!user.twoFactorSecret) {
    user.twoFactorSecret = secret;
    await user.save();
  }
  res.status(200).json({ success: true, data: { secret, qr } });
});

export const confirmTwoFactor = asyncHandler(async (req: Request, res: Response) => {
  const code = String(req.body.code || "").replace(/\s/g, "");
  const user = await AdminUserModel.findById(req.user!._id).select("+twoFactorSecret");
  if (!user || !user.twoFactorSecret) throw ApiError.badRequest("Run 2FA setup first");
  if (!authenticator.verify({ token: code, secret: user.twoFactorSecret })) {
    throw ApiError.badRequest("Invalid authentication code");
  }
  user.twoFactorEnabled = true;
  await user.save();
  await logActivity({ user, action: "2fa_enabled", description: "Two-factor authentication enabled", req });
  res.status(200).json({ success: true, data: { message: "2FA enabled" } });
});

export const disableTwoFactor = asyncHandler(async (req: Request, res: Response) => {
  const code = String(req.body.code || "").replace(/\s/g, "");
  const user = await AdminUserModel.findById(req.user!._id).select("+twoFactorSecret");
  if (!user) throw ApiError.notFound("User not found");
  if (!user.twoFactorSecret || !authenticator.verify({ token: code, secret: user.twoFactorSecret })) {
    throw ApiError.badRequest("Invalid authentication code");
  }
  user.twoFactorEnabled = false;
  await user.save();
  await logActivity({ user, action: "2fa_disabled", description: "Two-factor authentication disabled", req });
  res.status(200).json({ success: true, data: { message: "2FA disabled" } });
});

// ---------- Admin user management (super admin / admin only) ----------

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await AdminUserModel.find().sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, data: users.map(publicUser) });
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { name: string; email: string; password: string; role: string; phone?: string; isActive?: boolean };
  const existing = await AdminUserModel.findOne({ email: body.email.toLowerCase() });
  if (existing) throw ApiError.conflict("An admin with this email already exists");
  const user = await AdminUserModel.create({ ...body, email: body.email.toLowerCase(), createdBy: req.user!._id });
  await logActivity({ user: req.user, action: "create_user", entity: "admin_user", entityId: user._id, description: `Created admin user ${user.name} (${user.role})`, req });
  res.status(201).json({ success: true, data: { user: publicUser(user.toObject()) } });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body as { name?: string; email?: string; password?: string; role?: string; phone?: string; isActive?: boolean };
  const user = await AdminUserModel.findById(id);
  if (!user) throw ApiError.notFound("User not found");
  const target = user.toObject();

  if (target.role === "super_admin" && body.role && body.role !== "super_admin" && req.user!.role === "super_admin") {
    const superAdmins = await AdminUserModel.countDocuments({ role: "super_admin" });
    if (superAdmins <= 1) throw ApiError.badRequest("Cannot demote the last super admin");
  }
  if (body.email && body.email.toLowerCase() !== user.email) {
    const exists = await AdminUserModel.findOne({ email: body.email.toLowerCase(), _id: { $ne: id } });
    if (exists) throw ApiError.conflict("Another admin uses this email");
  }

  Object.assign(user, body, body.email ? { email: body.email.toLowerCase() } : {});
  await user.save();
  await logActivity({ user: req.user, action: "update_user", entity: "admin_user", entityId: id, description: `Updated admin ${user.name}`, req });
  res.status(200).json({ success: true, data: { user: publicUser(user.toObject()) } });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (id === req.user!._id) throw ApiError.badRequest("You cannot delete your own account");
  const user = await AdminUserModel.findById(id);
  if (!user) throw ApiError.notFound("User not found");
  if (user.role === "super_admin") {
    const superAdmins = await AdminUserModel.countDocuments({ role: "super_admin" });
    if (superAdmins <= 1) throw ApiError.badRequest("Cannot delete the last super admin");
  }
  await RefreshTokenModel.deleteMany({ user: user._id });
  await AdminUserModel.findByIdAndDelete(id);
  await logActivity({ user: req.user, action: "delete_user", entity: "admin_user", entityId: id, description: `Deleted admin ${user.name}`, req });
  res.status(200).json({ success: true, data: { message: "User deleted" } });
});
