import { connectDB, disconnectDB } from "../config/db";
import { AdminUserModel } from "../models/AdminUser";
import { env } from "../config/env";
import { ROLES, Role } from "../types";

/**
 * Creates the initial Super Admin account. Safe to run multiple times.
 * Usage: npm run seed:admin  (uses ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD from .env)
 */
async function run() {
  await connectDB();
  const existing = await AdminUserModel.findOne({ email: env.ADMIN_BOOTSTRAP.EMAIL.toLowerCase() });
  if (existing) {
    console.log(`[seed] Admin already exists: ${existing.email}`);
    await disconnectDB();
    return;
  }
  const role: Role = "super_admin";
  const user = await AdminUserModel.create({
    name: env.ADMIN_BOOTSTRAP.NAME,
    email: env.ADMIN_BOOTSTRAP.EMAIL.toLowerCase(),
    password: env.ADMIN_BOOTSTRAP.PASSWORD,
    role,
    isActive: true,
  });
  console.log(`[seed] Super Admin created: ${user.email} (role: ${ROLES.includes(role) ? role : "?"})`);
  console.log("[seed] CHANGE THE DEFAULT PASSWORD AFTER FIRST LOGIN.");
  await disconnectDB();
}

run().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
