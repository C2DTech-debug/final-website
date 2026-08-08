import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import apiRoutes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { maintenanceMode } from "./middleware/security";
import { isCloudinaryConfigured } from "./services/storageService";
import { logger } from "./utils/logger";
import { swaggerSpec, swaggerUiOptions } from "./config/swagger";

async function bootstrap() {
  const app = express();

  app.disable("x-powered-by");

  // Render (and other proxies) forward X-Forwarded-For. Trusting the first hop
  // makes req.ip reflect the real client IP and keeps express-rate-limit from
  // throwing ERR_ERL_UNEXPECTED_X_FORWARDED_FOR on every rate-limited route.
  app.set("trust proxy", env.isProduction ? 1 : false);

  // Security headers (CSP relaxed for admin + image CDNs)
  app.use(
    helmet({
      contentSecurityPolicy: env.isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", "data:", "https:", "http:"],
              connectSrc: ["'self'", "https:", "http:"],
              fontSrc: ["'self'", "data:", "https:"],
              frameAncestors: ["'none'"],
            },
          }
        : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || env.CLIENT_URLS.includes(origin)) return cb(null, true);
        cb(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );

  app.use(morgan(env.isProduction ? "combined" : "dev"));

  app.use(maintenanceMode);

  // Local file serving is a development fallback only. In production all files
  // live in Cloudinary and are served from their CDN URLs.
  if (!env.isProduction) {
    app.use("/uploads", express.static(path.join(process.cwd(), "uploads"), { maxAge: "7d", immutable: false }));
  } else if (!isCloudinaryConfigured()) {
    logger.warn(
      "Cloudinary is NOT configured (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET). File uploads will be rejected until it is set."
    );
  }

  app.get("/", (_req, res) => {
    res.json({ service: "C2D Tech API", docs: `${env.API_PREFIX}/health`, swagger: "/api-docs", status: "running" });
  });

  // Swagger documentation
  const swaggerUi = require("swagger-ui-express");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  app.use(env.API_PREFIX, apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`C2D Tech API listening on http://localhost:${env.PORT}${env.API_PREFIX}`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(() => {
      require("mongoose").disconnect().then(() => process.exit(0)).catch(() => process.exit(1));
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  fs.mkdirSync(path.join(process.cwd(), "logs"), { recursive: true });
}

bootstrap().catch((err) => {
  logger.error("Fatal error during bootstrap:", err);
  process.exit(1);
});
