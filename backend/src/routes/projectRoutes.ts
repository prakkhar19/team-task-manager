import { Router } from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  addMember,
  removeMember,
  deleteProject,
} from "../controllers/projectController";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.use(requireAuth);

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);
router.delete("/:id", deleteProject);

// Task Routes
router.post("/:id/tasks", createTask);
router.get("/:id/tasks", getTasks);
router.get("/:id/tasks/:taskId", getTaskById);
router.put("/:id/tasks/:taskId", updateTask);
router.delete("/:id/tasks/:taskId", deleteTask);

export default router;
