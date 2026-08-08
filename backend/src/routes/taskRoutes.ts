import { Router } from "express";
import { authenticate, requirePermission } from "../middleware/auth";
import {
  listMyTasks,
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  submitTask,
  verifyTask,
  myTaskStats,
} from "../controllers/taskController";

const router = Router();

router.get("/my", authenticate, requirePermission("tasks:view"), listMyTasks);
router.get("/my/stats", authenticate, requirePermission("tasks:view"), myTaskStats);
router.get("/", authenticate, requirePermission("tasks:view_all"), listTasks);
router.get("/:id", authenticate, requirePermission("tasks:view"), getTask);
router.post("/", authenticate, requirePermission("tasks:create"), createTask);
router.put("/:id", authenticate, requirePermission("tasks:update"), updateTask);
router.delete("/:id", authenticate, requirePermission("tasks:delete"), deleteTask);
router.post("/:id/submit", authenticate, requirePermission("tasks:submit"), submitTask);
router.post("/:id/verify", authenticate, requirePermission("tasks:verify"), verifyTask);

export default router;
