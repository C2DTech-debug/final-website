import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { env } from "../src/config/env";
import { storeFile } from "../src/services/storageService";
import { MediaAssetModel } from "../src/models/MediaAsset";
import { TeamMemberModel } from "../src/models/TeamMember";
import { JobApplicationModel } from "../src/models/JobApplication";
import { BlogModel } from "../src/models/Blog";
import { PortfolioProjectModel } from "../src/models/PortfolioProject";
import { SEOSettingModel } from "../src/models/SEOSetting";
import { ServiceModel } from "../src/models/Service";
import { TestimonialModel } from "../src/models/Testimonial";
import { WebsiteSettingModel } from "../src/models/WebsiteSetting";
import { AdminUserModel } from "../src/models/AdminUser";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");
const migrated = new Map<string, string>(); // local URL -> cloud URL
const missing: string[] = [];

function localToFile(localUrl: string): string {
  const rel = localUrl.replace(/^\/uploads\//, "");
  return path.join(UPLOADS_ROOT, ...rel.split("/"));
}

function resolveFile(localUrl: string): string | null {
  const exact = localToFile(localUrl);
  if (fs.existsSync(exact)) return exact;
  const inMisc = path.join(UPLOADS_ROOT, "misc", path.basename(localUrl));
  if (fs.existsSync(inMisc)) return inMisc;
  return null;
}

async function toCloud(localUrl: string, folder: string): Promise<string> {
  if (!localUrl.startsWith("/uploads/")) return localUrl;
  if (migrated.has(localUrl)) return migrated.get(localUrl)!;
  const filePath = resolveFile(localUrl);
  if (!filePath) {
    missing.push(localUrl);
    return localUrl;
  }
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".pdf" ? "application/pdf" : ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".gif" ? "image/gif" : ext === ".svg" ? "image/svg+xml" : ext === ".mp4" ? "video/mp4" : "image/jpeg";
  const file = { buffer: buf, originalname: path.basename(filePath), mimetype: mime } as Express.Multer.File;
  const stored = await storeFile(file, folder);
  migrated.set(localUrl, stored.url);
  console.log(`  ${localUrl} -> ${stored.url}`);
  return stored.url;
}

async function updateField(model: mongoose.Model<any>, filter: Record<string, unknown>, field: string, value: unknown) {
  await model.updateOne(filter, { $set: { [field]: value } });
}

async function main() {
  await mongoose.connect(env.MONGODB_URI);
  console.log("connected. migrating...\n");

  // 1. Media assets
  const media = await MediaAssetModel.find({ $or: [{ url: /^\/uploads\// }, { provider: "local" }] }).lean();
  for (const m of media) {
    const url = await toCloud(m.url as string, "media");
    if (url !== m.url) {
      await updateField(MediaAssetModel, { _id: m._id }, "url", url);
      await updateField(MediaAssetModel, { _id: m._id }, "provider", "cloudinary");
    }
  }
  console.log(`media: ${media.length} checked`);

  // 2. Team photos
  const members = await TeamMemberModel.find({ photo: /^\/uploads\// }).lean();
  for (const m of members) {
    const photo = await toCloud(m.photo as string, "team");
    if (photo !== m.photo) await updateField(TeamMemberModel, { _id: m._id }, "photo", photo);
  }
  console.log(`team: ${members.length} checked`);

  // 3. Resumes
  const apps = await JobApplicationModel.find({ resumeUrl: /^\/uploads\// }).lean();
  for (const a of apps) {
    const resumeUrl = await toCloud(a.resumeUrl as string, "resumes");
    if (resumeUrl !== a.resumeUrl) await updateField(JobApplicationModel, { _id: a._id }, "resumeUrl", resumeUrl);
  }
  console.log(`resumes: ${apps.length} checked`);

  // 4. Blogs
  const blogs = await BlogModel.find({ $or: [{ coverImage: /^\/uploads\// }, { ogImage: /^\/uploads\// }] }).lean();
  for (const b of blogs) {
    const coverImage = await toCloud(b.coverImage as string, "blogs");
    const ogImage = await toCloud(b.ogImage as string, "blogs");
    if (coverImage !== b.coverImage || ogImage !== b.ogImage) {
      await updateField(BlogModel, { _id: b._id }, "coverImage", coverImage);
      await updateField(BlogModel, { _id: b._id }, "ogImage", ogImage);
    }
  }
  console.log(`blogs: ${blogs.length} checked`);

  // 5. Portfolio (cover + gallery)
  const projects = await PortfolioProjectModel.find({ $or: [{ coverImage: /^\/uploads\// }, { gallery: /^\/uploads\// }] }).lean();
  for (const p of projects) {
    const coverImage = await toCloud(p.coverImage as string, "portfolio");
    const gallery = Array.isArray(p.gallery)
      ? await Promise.all((p.gallery as string[]).map((g) => toCloud(g, "portfolio")))
      : p.gallery;
    await updateField(PortfolioProjectModel, { _id: p._id }, "coverImage", coverImage);
    await updateField(PortfolioProjectModel, { _id: p._id }, "gallery", gallery);
  }
  console.log(`portfolio: ${projects.length} checked`);

  // 6. SEO settings
  const seos = await SEOSettingModel.find({ $or: [{ ogImage: /^\/uploads\// }, { twitterImage: /^\/uploads\// }] }).lean();
  for (const s of seos) {
    const ogImage = await toCloud(s.ogImage as string, "seo");
    const twitterImage = await toCloud(s.twitterImage as string, "seo");
    await updateField(SEOSettingModel, { _id: s._id }, "ogImage", ogImage);
    await updateField(SEOSettingModel, { _id: s._id }, "twitterImage", twitterImage);
  }
  console.log(`seo: ${seos.length} checked`);

  // 7. Services
  const services = await ServiceModel.find({ $or: [{ image: /^\/uploads\// }, { ogImage: /^\/uploads\// }, { twitterImage: /^\/uploads\// }] }).lean();
  for (const s of services) {
    const image = await toCloud(s.image as string, "services");
    const ogImage = await toCloud(s.ogImage as string, "services");
    const twitterImage = await toCloud(s.twitterImage as string, "services");
    await updateField(ServiceModel, { _id: s._id }, "image", image);
    await updateField(ServiceModel, { _id: s._id }, "ogImage", ogImage);
    await updateField(ServiceModel, { _id: s._id }, "twitterImage", twitterImage);
  }
  console.log(`services: ${services.length} checked`);

  // 8. Testimonials
  const tms = await TestimonialModel.find({ avatar: /^\/uploads\// }).lean();
  for (const t of tms) {
    const avatar = await toCloud(t.avatar as string, "testimonials");
    if (avatar !== t.avatar) await updateField(TestimonialModel, { _id: t._id }, "avatar", avatar);
  }
  console.log(`testimonials: ${tms.length} checked`);

  // 9. Website settings (image-type values)
  const settings = await WebsiteSettingModel.find({ type: "image" }).lean();
  for (const s of settings) {
    if (typeof s.value === "string" && (s.value as string).startsWith("/uploads/")) {
      const value = await toCloud(s.value as string, "settings");
      if (value !== s.value) await updateField(WebsiteSettingModel, { _id: s._id }, "value", value);
    }
  }
  console.log(`settings: ${settings.length} checked`);

  // 10. Admin avatars
  const users = await AdminUserModel.find({ avatar: /^\/uploads\// }).lean();
  for (const u of users) {
    const avatar = await toCloud(u.avatar as string, "avatars");
    if (avatar !== u.avatar) await updateField(AdminUserModel, { _id: u._id }, "avatar", avatar);
  }
  console.log(`admin avatars: ${users.length} checked`);

  console.log(`\nmigrated ${migrated.size} unique files`);
  if (missing.length) console.log(`MISSING files on disk (skipped):\n  ${missing.join("\n  ")}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error("MIGRATION ERROR:", e);
  process.exit(1);
});
