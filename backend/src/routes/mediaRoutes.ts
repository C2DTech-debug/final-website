import { Router } from "express";
import multer from "multer";
import { authenticate, requirePermission } from "../middleware/auth";
import { uploadMedia, listMedia, deleteMedia } from "../controllers/mediaController";

const router = Router();

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif", "image/bmp", "video/mp4", "video/webm", "application/pdf"];

// Files are held in memory and pushed straight to cloud storage by the
// controller — nothing is written to local disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Unsupported file type"));
  },
});

router.get("/", authenticate, requirePermission("media:manage"), listMedia);
router.post("/", authenticate, requirePermission("media:manage"), upload.single("file"), uploadMedia);
router.delete("/:id", authenticate, requirePermission("media:manage"), deleteMedia);

export default router;
