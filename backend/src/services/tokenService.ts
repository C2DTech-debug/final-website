import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";

export interface AccessPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
  type: "access";
}

export interface RefreshPayload {
  sub: string;
  type: "refresh";
  jti: string;
}

export function signAccessToken(user: { _id: string; email: string; role: string; name: string }): string {
  const payload: AccessPayload = {
    sub: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
    type: "access",
  };
  return jwt.sign(payload, env.JWT.ACCESS_SECRET, {
    expiresIn: env.JWT.ACCESS_EXPIRES as jwt.SignOptions["expiresIn"],
    issuer: env.JWT.ISSUER,
  });
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, env.JWT.ACCESS_SECRET, { issuer: env.JWT.ISSUER }) as AccessPayload;
}

export function signRefreshToken(userId: string, jti: string): string {
  const payload: RefreshPayload = { sub: userId, type: "refresh", jti };
  return jwt.sign(payload, env.JWT.REFRESH_SECRET, {
    expiresIn: env.JWT.REFRESH_EXPIRES as jwt.SignOptions["expiresIn"],
    issuer: env.JWT.ISSUER,
  });
}

export function verifyRefreshToken(token: string): RefreshPayload {
  return jwt.verify(token, env.JWT.REFRESH_SECRET, { issuer: env.JWT.ISSUER }) as RefreshPayload;
}

export function generateRefreshTokenId(): string {
  return crypto.randomBytes(48).toString("hex");
}

export function refreshTokenLifetimeMs(): number {
  const unit = env.JWT.REFRESH_EXPIRES.slice(-1);
  const value = parseInt(env.JWT.REFRESH_EXPIRES, 10);
  switch (unit) {
    case "d":
      return value * 24 * 60 * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "m":
      return value * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}
