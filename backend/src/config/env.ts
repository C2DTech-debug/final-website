import dotenv from "dotenv";

dotenv.config();

const requiredInProd = [
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "MONGODB_URI",
];

if (process.env.NODE_ENV === "production") {
  for (const key of requiredInProd) {
    const value = process.env[key];
    if (!value || value.startsWith("change_me")) {
      throw new Error(`[env] Missing or placeholder value for required env var: ${key}`);
    }
  }
}

function bool(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true" || value === "1";
}

function num(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && value !== undefined ? parsed : fallback;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  PORT: num(process.env.PORT, 5000),
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/c2dtech",
  CLIENT_URLS: (process.env.CLIENT_URL || "http://localhost:3000")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean),

  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "dev_access_secret",
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret",
    ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "15m",
    REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "7d",
    ISSUER: process.env.JWT_ISSUER || "c2d-tech-api",
  },

  API_PREFIX: process.env.API_PREFIX || "/api/v1",

  COOKIE: {
    SECURE: bool(process.env.COOKIE_SECURE, false),
    SAME_SITE: (process.env.COOKIE_SAME_SITE as "lax" | "strict" | "none") || "lax",
  },

  SMTP: {
    HOST: process.env.SMTP_HOST || "",
    PORT: num(process.env.SMTP_PORT, 587),
    SECURE: bool(process.env.SMTP_SECURE, false),
    USER: process.env.SMTP_USER || "",
    PASS: process.env.SMTP_PASS || "",
    FROM: process.env.MAIL_FROM || "C2D Tech <no-reply@c2dtech.example.com>",
    ADMIN_TO: process.env.MAIL_ADMIN_TO || "",
  },

  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
    API_KEY: process.env.CLOUDINARY_API_KEY || "",
    API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  },

  RECAPTCHA_SECRET: process.env.RECAPTCHA_SECRET || "",
  WHATSAPP_ADMIN_NUMBER: process.env.WHATSAPP_ADMIN_NUMBER || "",

  RATE_LIMIT: {
    WINDOW_MS: num(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    MAX: num(process.env.RATE_LIMIT_MAX, 100),
  },

  MAINTENANCE_MODE: bool(process.env.MAINTENANCE_MODE, false),

  ADMIN_BOOTSTRAP: {
    NAME: process.env.ADMIN_NAME || "C2D Admin",
    EMAIL: process.env.ADMIN_EMAIL || "admin@c2dtech.example.com",
    PASSWORD: process.env.ADMIN_PASSWORD || "ChangeMe123!",
  },
} as const;

export const isEmailConfigured = Boolean(env.SMTP.HOST && env.SMTP.USER);
