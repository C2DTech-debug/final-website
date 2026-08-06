import winston from "winston";
import { env } from "../config/env";

const { combine, timestamp, printf, colorize, json } = winston.format;

const devFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

const transports: winston.transport[] = [new winston.transports.Console()];

// Log files are a development convenience only — production logs to stdout so
// nothing is written to local disk (containers collect console output).
if (!env.isProduction) {
  transports.push(
    new winston.transports.File({ filename: "logs/error.log", level: "error", maxsize: 5 * 1024 * 1024 }),
    new winston.transports.File({ filename: "logs/combined.log", maxsize: 10 * 1024 * 1024 })
  );
}

export const logger = winston.createLogger({
  level: env.isProduction ? "info" : "debug",
  format: env.isProduction ? combine(timestamp(), json()) : combine(timestamp(), colorize(), devFormat),
  transports,
  exitOnError: false,
});
