import { Router } from "express";
import { authenticate, isSuperAdmin, isAdminOrAbove } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimit";
import { validate } from "../utils/asyncHandler";
import {
  login,
  verifyTwoFactor,
  refresh,
  logout,
  me,
  changePassword,
  setupTwoFactor,
  confirmTwoFactor,
  disableTwoFactor,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/authController";
import { loginSchema, changePasswordSchema, createAdminUserSchema, updateAdminUserSchema } from "../schemas";

const router = Router();

router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/login/2fa", authLimiter, verifyTwoFactor);
router.post("/refresh", refresh);
router.post("/logout", authenticate, logout);

router.get("/me", authenticate, me);
router.post("/change-password", authenticate, validate(changePasswordSchema), changePassword);
router.post("/2fa/setup", authenticate, setupTwoFactor);
router.post("/2fa/enable", authenticate, confirmTwoFactor);
router.post("/2fa/disable", authenticate, disableTwoFactor);

router.get("/users", authenticate, isAdminOrAbove, listUsers);
router.post("/users", authenticate, isSuperAdmin, validate(createAdminUserSchema), createUser);
router.put("/users/:id", authenticate, isSuperAdmin, validate(updateAdminUserSchema), updateUser);
router.delete("/users/:id", authenticate, isSuperAdmin, deleteUser);

export default router;
