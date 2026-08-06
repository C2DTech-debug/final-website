import { Router } from "express";
import { PageVisitModel } from "../models/PageVisit";
import { ContactMessageModel } from "../models/ContactMessage";
import { ProjectEstimateModel } from "../models/ProjectEstimate";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate, isStaffOrAbove } from "../middleware/auth";

const router = Router();

function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
  if (/iPad|Tablet/.test(ua)) return "tablet";
  if (/Mobile|Android|iPhone|iPod/.test(ua)) return "mobile";
  return "desktop";
}

export const trackVisit = asyncHandler(async (req, res) => {
  const { path, referrer, session } = req.body;
  const ua = req.headers["user-agent"] || "";
  const crypto = require("crypto");
  const ipHash = crypto.createHash("sha256").update((req.ip || "x") + "|c2d-salt").digest("hex").slice(0, 24);
  await PageVisitModel.create({
    path: typeof path === "string" ? path.slice(0, 500) : "/",
    referrer: typeof referrer === "string" ? referrer.slice(0, 500) : "",
    device: detectDevice(ua),
    browser: ua.split(" ")[0] || "unknown",
    ipHash,
    session: typeof session === "string" ? session.slice(0, 64) : "",
  });
  res.status(201).json({ success: true, data: { tracked: true } });
});

router.get("/overview", authenticate, isStaffOrAbove, asyncHandler(async (req, res) => {
  const days = Math.min(90, Math.max(1, Number(req.query.days) || 30));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [totalVisits, uniqueVisits, byDay, byDevice, byPage, contacts, estimates] = await Promise.all([
    PageVisitModel.countDocuments({ createdAt: { $gte: since } }),
    PageVisitModel.distinct("ipHash", { createdAt: { $gte: since } }),
    PageVisitModel.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    PageVisitModel.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$device", count: { $sum: 1 } } },
    ]),
    PageVisitModel.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    ContactMessageModel.countDocuments({ createdAt: { $gte: since } }),
    ProjectEstimateModel.countDocuments({ createdAt: { $gte: since } }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      days,
      totalVisits,
      uniqueVisits: uniqueVisits.length,
      leads: contacts,
      estimates,
      byDay,
      byDevice: Object.fromEntries(byDevice.map((d) => [d._id, d.count])),
      byPage,
    },
  });
}));

export default router;
