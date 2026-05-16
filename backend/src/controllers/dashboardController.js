"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const cache = {};
const CACHE_TTL = 60 * 1000; // 60 seconds
const getDashboard = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        // Check cache
        const cached = cache[userId];
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return res.json(cached.data);
        }
        // Determine if user is Admin in ANY project
        const adminProjects = await prismaClient_1.default.projectMember.findMany({
            where: { userId, role: "Admin" },
            select: { projectId: true },
        });
        const isAdmin = adminProjects.length > 0;
        const adminProjectIds = adminProjects.map((p) => p.projectId);
        // Fetch tasks where user is assigned or creator
        const userTasks = await prismaClient_1.default.task.findMany({
            where: {
                OR: [{ assignedTo: userId }, { createdBy: userId }],
            },
        });
        const totalTasks = userTasks.length;
        const tasksByStatus = {
            "To Do": 0,
            "In Progress": 0,
            "Done": 0,
        };
        const overdueTasks = [];
        const now = new Date();
        userTasks.forEach((task) => {
            if (tasksByStatus[task.status] !== undefined) {
                tasksByStatus[task.status]++;
            }
            if (task.dueDate && new Date(task.dueDate) < now && task.status !== "Done") {
                overdueTasks.push(task);
            }
        });
        // Project summary
        const userProjects = await prismaClient_1.default.project.findMany({
            where: { members: { some: { userId } } },
            include: { tasks: { select: { status: true } } },
        });
        const projectSummary = userProjects.map((p) => {
            const total = p.tasks.length;
            const done = p.tasks.filter((t) => t.status === "Done").length;
            return {
                id: p.id,
                title: p.title,
                completionPercentage: total === 0 ? 0 : Math.round((done / total) * 100),
            };
        });
        // tasksByUser (Admin only)
        let tasksByUser = null;
        if (isAdmin) {
            // Find all tasks in projects where user is Admin
            const tasksInAdminProjects = await prismaClient_1.default.task.findMany({
                where: { projectId: { in: adminProjectIds }, assignedTo: { not: null } },
                include: { assignee: { select: { name: true } } },
            });
            tasksByUser = {};
            tasksInAdminProjects.forEach((task) => {
                const name = task.assignee.name;
                tasksByUser[name] = (tasksByUser[name] || 0) + 1;
            });
        }
        const responseData = {
            totalTasks,
            tasksByStatus,
            tasksByUser,
            overdueTasks,
            projectSummary,
        };
        cache[userId] = {
            data: responseData,
            timestamp: Date.now(),
        };
        return res.json(responseData);
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboard = getDashboard;
//# sourceMappingURL=dashboardController.js.map