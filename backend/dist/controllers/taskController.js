"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTaskById = exports.getTasks = exports.createTask = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const schemas_1 = require("../schemas");
const apiError_1 = require("../utils/apiError");
const projectController_1 = require("./projectController");
const createTask = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const adminId = req.user.userId;
        const data = schemas_1.taskSchema.parse(req.body);
        await (0, projectController_1.checkProjectAccess)(projectId, adminId, true);
        if (data.assignedTo) {
            const isMember = await prismaClient_1.default.projectMember.findUnique({
                where: { projectId_userId: { projectId, userId: data.assignedTo } },
            });
            if (!isMember) {
                throw new apiError_1.ApiError(400, "Assigned user must be a member of the project", "INVALID_ASSIGNEE");
            }
        }
        const task = await prismaClient_1.default.task.create({
            data: {
                projectId,
                title: data.title,
                description: data.description,
                status: data.status,
                priority: data.priority,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                createdBy: adminId,
                assignedTo: data.assignedTo,
            },
            include: {
                assignee: { select: { id: true, name: true, email: true } },
            },
        });
        return res.status(201).json(task);
    }
    catch (error) {
        next(error);
    }
};
exports.createTask = createTask;
const getTasks = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const userId = req.user.userId;
        await (0, projectController_1.checkProjectAccess)(projectId, userId);
        const tasks = await prismaClient_1.default.task.findMany({
            where: { projectId },
            include: {
                assignee: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        return res.json(tasks);
    }
    catch (error) {
        next(error);
    }
};
exports.getTasks = getTasks;
const getTaskById = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const taskId = req.params.taskId;
        const userId = req.user.userId;
        await (0, projectController_1.checkProjectAccess)(projectId, userId);
        const task = await prismaClient_1.default.task.findFirst({
            where: { id: taskId, projectId },
            include: {
                assignee: { select: { id: true, name: true, email: true } },
            },
        });
        if (!task) {
            throw new apiError_1.ApiError(404, "Task not found", "NOT_FOUND");
        }
        return res.json(task);
    }
    catch (error) {
        next(error);
    }
};
exports.getTaskById = getTaskById;
const updateTask = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const taskId = req.params.taskId;
        const userId = req.user.userId;
        const data = schemas_1.updateTaskSchema.parse(req.body);
        const member = await (0, projectController_1.checkProjectAccess)(projectId, userId);
        const task = await prismaClient_1.default.task.findFirst({
            where: { id: taskId, projectId },
        });
        if (!task) {
            throw new apiError_1.ApiError(404, "Task not found", "NOT_FOUND");
        }
        if (member.role === "Member") {
            // Member can only update status of their own assigned tasks
            if (task.assignedTo !== userId) {
                throw new apiError_1.ApiError(403, "Members can only update their own assigned tasks", "FORBIDDEN");
            }
            const allowedFields = Object.keys(data);
            if (allowedFields.length > 1 || (allowedFields.length === 1 && allowedFields[0] !== "status")) {
                throw new apiError_1.ApiError(403, "Members can only update task status", "FORBIDDEN");
            }
        }
        else {
            // Admin updating assignedTo
            if (data.assignedTo !== undefined && data.assignedTo !== null) {
                const isAssigneeMember = await prismaClient_1.default.projectMember.findUnique({
                    where: { projectId_userId: { projectId, userId: data.assignedTo } },
                });
                if (!isAssigneeMember) {
                    throw new apiError_1.ApiError(400, "Assigned user must be a member of the project", "INVALID_ASSIGNEE");
                }
            }
        }
        // Status transition validation
        if (data.status && data.status !== task.status) {
            const validTransitions = {
                "To Do": ["In Progress"],
                "In Progress": ["Done", "To Do"], // Allowing back to To Do just in case, but strictly maybe just forward? "transitions must follow: 'To Do' -> 'In Progress' -> 'Done' (enforce strictly)"
                "Done": ["In Progress"], // Allowing back to in progress
            };
            // Let's enforce strict one-way or adjacent transitions based on prompt: "status transitions must follow: 'To Do' -> 'In Progress' -> 'Done' (enforce strictly)"
            const strictTransitions = {
                "To Do": ["In Progress"],
                "In Progress": ["Done"],
                "Done": [],
            };
            if (!strictTransitions[task.status].includes(data.status)) {
                throw new apiError_1.ApiError(400, `Invalid status transition from ${task.status} to ${data.status}`, "INVALID_TRANSITION");
            }
        }
        const updatedTask = await prismaClient_1.default.task.update({
            where: { id: taskId },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.status && { status: data.status }),
                ...(data.priority && { priority: data.priority }),
                ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
                ...(data.assignedTo !== undefined && { assignedTo: data.assignedTo }),
            },
            include: {
                assignee: { select: { id: true, name: true, email: true } },
            },
        });
        return res.json(updatedTask);
    }
    catch (error) {
        next(error);
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const taskId = req.params.taskId;
        const adminId = req.user.userId;
        await (0, projectController_1.checkProjectAccess)(projectId, adminId, true);
        const task = await prismaClient_1.default.task.findFirst({
            where: { id: taskId, projectId },
        });
        if (!task) {
            throw new apiError_1.ApiError(404, "Task not found", "NOT_FOUND");
        }
        await prismaClient_1.default.task.delete({
            where: { id: taskId },
        });
        return res.json({ message: "Task deleted successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTask = deleteTask;
//# sourceMappingURL=taskController.js.map