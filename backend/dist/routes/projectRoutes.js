"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_1 = require("../controllers/projectController");
const taskController_1 = require("../controllers/taskController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.requireAuth);
router.post("/", projectController_1.createProject);
router.get("/", projectController_1.getProjects);
router.get("/:id", projectController_1.getProjectById);
router.post("/:id/members", projectController_1.addMember);
router.delete("/:id/members/:userId", projectController_1.removeMember);
router.delete("/:id", projectController_1.deleteProject);
// Task Routes
router.post("/:id/tasks", taskController_1.createTask);
router.get("/:id/tasks", taskController_1.getTasks);
router.get("/:id/tasks/:taskId", taskController_1.getTaskById);
router.put("/:id/tasks/:taskId", taskController_1.updateTask);
router.delete("/:id/tasks/:taskId", taskController_1.deleteTask);
exports.default = router;
//# sourceMappingURL=projectRoutes.js.map