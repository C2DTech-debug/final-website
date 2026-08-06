import fs from "fs";
import path from "path";
import crypto from "crypto";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

export interface StoredFile {
  url: string;
  publicId: string;
  provider: "cloudinary" | "local";
}

export const isCloudinaryConfigured = (): boolean =>
  Boolean(env.CLOUDINARY.CLOUD_NAME && env.CLOUDINARY.API_KEY && env.CLOUDINARY.API_SECRET);

type CloudinaryResource = "image" | "video" | "raw";

function cloudinaryResourceType(mime: string): CloudinaryResource {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "raw";
}

function uploadToCloudinary(
  buffer: Buffer,
  mime: string,
  originalName: string
): Promise<{ url: string; publicId: string }> {
  const { CLOUD_NAME, API_KEY, API_SECRET } = env.CLOUDINARY;
  const timestamp = Math.round(Date.now() / 1000).toString();
  const signature = crypto.createHash("sha1").update(`timestamp=${timestamp}${API_SECRET}`).digest("hex");

  const form = new FormData();
  form.append("file", new Blob([buffer], { type: mime }), originalName);
  form.append("api_key", API_KEY);
  form.append("timestamp", timestamp);
  form.append("signature", signature);

  const resourceType = cloudinaryResourceType(mime);
  return fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, { method: "POST", body: form })
    .then((r) => r.json() as Promise<{ secure_url?: string; public_id?: string; error?: { message: string } }>)
    .then((data) => {
      if (data.error) throw new Error(data.error.message);
      return { url: data.secure_url!, publicId: data.public_id! };
    });
}

function destroyCloudinaryFile(publicId: string, resourceType: CloudinaryResource): Promise<void> {
  const { CLOUD_NAME, API_KEY, API_SECRET } = env.CLOUDINARY;
  const timestamp = Math.round(Date.now() / 1000).toString();
  const signature = crypto.createHash("sha1").update(`public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`).digest("hex");

  return fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/destroy`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `public_id=${encodeURIComponent(publicId)}&timestamp=${timestamp}&signature=${signature}&api_key=${API_KEY}`,
    }
  )
    .then(() => undefined)
    .catch(() => undefined);
}

/**
 * Persist an uploaded file.
 *
 * Production is cloud-only: files are uploaded straight to Cloudinary (never
 * written to local disk) and the upload is rejected if Cloudinary is not
 * configured. In development, files fall back to the local /uploads directory
 * so the app works without cloud credentials.
 */
export async function storeFile(file: Express.Multer.File, folder?: string): Promise<StoredFile> {
  const mime = file.mimetype || "application/octet-stream";

  if (isCloudinaryConfigured()) {
    try {
      const { url, publicId } = await uploadToCloudinary(file.buffer, mime, file.originalname);
      return { url, publicId, provider: "cloudinary" };
    } catch (e) {
      throw ApiError.badRequest("Cloudinary upload failed: " + (e instanceof Error ? e.message : "unknown"));
    }
  }

  if (env.isProduction) {
    throw ApiError.badRequest(
      "Cloud storage is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to accept uploads."
    );
  }

  const subDir = path.join(process.cwd(), "uploads", folder || "misc");
  fs.mkdirSync(subDir, { recursive: true });
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${path.extname(file.originalname)}`;
  fs.writeFileSync(path.join(subDir, filename), file.buffer);
  const dir = folder || "misc";
  return { url: `/uploads/${dir}/${filename}`, publicId: "", provider: "local" };
}

/**
 * Remove a stored file from Cloudinary (production) or the local /uploads dir
 * (development fallback). Best-effort; never throws.
 */
export function deleteStoredFile(
  provider: string | undefined,
  publicId: string | undefined,
  assetType: string | undefined,
  url: string | undefined
): void {
  if (provider === "cloudinary" && publicId && isCloudinaryConfigured()) {
    const resourceType: CloudinaryResource =
      assetType === "video" ? "video" : assetType === "pdf" || assetType === "other" ? "raw" : "image";
    void destroyCloudinaryFile(publicId, resourceType);
    return;
  }
  if (!env.isProduction && url && url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "uploads", path.basename(url));
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {
      /* best-effort */
    }
  }
}
