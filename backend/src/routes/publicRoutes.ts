import { Router } from "express";
import { getSiteBundle, getHomeBundle, getPublicSettings, listServices, getService, listPortfolio, getPortfolioProject, listTeam, listTestimonials, listFaqs, getSeoByPage, getEstimatorConfig } from "../controllers/publicController";
import { listPublishedBlogs, getPublishedBlog } from "../controllers/blogController";
import { listOpenJobs, getOpenJob, applyToJob } from "../controllers/careerController";
import { validate } from "../utils/asyncHandler";
import { jobApplicationSchema } from "../schemas";
import { uploadFile, multerErrorHandler } from "../middleware/upload";
import { standardLimiter, strictLimiter } from "../middleware/rateLimit";

const router = Router();

router.get("/bundle", getSiteBundle);
router.get("/home", getHomeBundle);
router.get("/settings", getPublicSettings);
router.get("/services", listServices);
router.get("/services/:slug", getService);
router.get("/portfolio", listPortfolio);
router.get("/portfolio/:slug", getPortfolioProject);
router.get("/team", listTeam);
router.get("/testimonials", listTestimonials);
router.get("/faqs", listFaqs);
router.get("/estimator-config", getEstimatorConfig);
router.get("/seo/:page", getSeoByPage);

// Blogs
router.get("/blogs", listPublishedBlogs);
router.get("/blogs/:slug", getPublishedBlog);

// Careers
router.get("/careers", listOpenJobs);
router.get("/careers/:slug", getOpenJob);
router.post("/careers/:slug/apply", strictLimiter, uploadFile("resume", { fieldName: "resume", maxSizeMb: 8, allowed: ["pdf", "doc", "docx", "image"] }), multerErrorHandler, validate(jobApplicationSchema), applyToJob);

export default router;
