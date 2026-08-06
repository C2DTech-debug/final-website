import multer from "multer";
import path from "path";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

const EXT_WHITELIST: Record<string, string[]> = {
  pdf: [".pdf"],
  doc: [".doc", ".docx", ".pdf", ".txt", ".rtf"],
  image: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  spreadsheet: [".csv", ".xlsx", ".xls"],
  any: [],
};

interface UploadOptions {
  fieldName?: string;
  maxSizeMb?: number;
  allowed?: (keyof typeof EXT_WHITELIST | string)[];
}

/** Multer middleware factory for public form file uploads (resumes, attachments). */
export function uploadFile(dest: string, options: UploadOptions = {}) {
  const fieldName = options.fieldName || "file";
  const maxSize = (options.maxSizeMb || 8) * 1024 * 1024;
  const allowedExts = options.allowed?.flatMap((k) => EXT_WHITELIST[k] || []) || [];

  // Files are held in memory and handed to the cloud storage service — nothing
  // is written to disk. `dest` is kept for API compatibility (group label).
  const storage = multer.memoryStorage();

  return multer({
    storage,
    limits: { fileSize: maxSize, files: 1 },
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExts.length && !allowedExts.includes(ext)) {
        return cb(ApiError.badRequest(`File type ${ext} is not allowed`));
      }
      cb(null, true);
    },
  }).single(fieldName);
}

/** Express error handler that normalizes multer errors into ApiError. */
export function multerErrorHandler(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "File too large" : `Upload error: ${err.message}`;
    return res.status(400).json({ success: false, error: { code: "UPLOAD_ERROR", message } });
  }
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
  }
  next(err);
}

/** Build an absolute URL for an uploaded file (local or proxied). */
export function toPublicUrl(req: Request, filePath: string): string {
  if (filePath.startsWith("http")) return filePath;
  return `/uploads/${filePath.replace(/\\/g, "/")}`;
}
