"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.removeMember = exports.addMember = exports.getProjectById = exports.getProjects = exports.createProject = exports.checkProjectAccess = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const schemas_1 = require("../schemas");
const apiError_1 = require("../utils/apiError");
// Middleware helper to check membership and role
const checkProjectAccess = async (projectId, userId, requireAdmin = false) => {
    const member = await prismaClient_1.default.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId,
            },
        },
    });
    if (!member) {
        throw new apiError_1.ApiError(403, "Access denied to this project", "FORBIDDEN");
    }
    if (requireAdmin && member.role !== "Admin") {
        throw new apiError_1.ApiError(403, "Admin access required", "FORBIDDEN");
    }
    return member;
};
exports.checkProjectAccess = checkProjectAccess;
const createProject = async (req, res, next) => {
    try {
        const data = schemas_1.projectSchema.parse(req.body);
        const userId = req.user.userId;
        const project = await prismaClient_1.default.project.create({
            data: {
                title: data.title,
                description: data.description,
                createdBy: userId,
                members: {
                    create: {
                        userId,
                        role: "Admin",
                    },
                },
            },
        });
        return res.status(201).json(project);
    }
    catch (error) {
        next(error);
    }
};
exports.createProject = createProject;
const getProjects = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const projects = await prismaClient_1.default.project.findMany({
            where: {
                members: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                _count: {
                    select: { tasks: true, members: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return res.json(projects);
    }
    catch (error) {
        next(error);
    }
};
exports.getProjects = getProjects;
const getProjectById = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const userId = req.user.userId;
        await (0, exports.checkProjectAccess)(projectId, userId);
        const project = await prismaClient_1.default.project.findUnique({
            where: { id: projectId },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
            },
        });
        return res.json(project);
    }
    catch (error) {
        next(error);
    }
};
exports.getProjectById = getProjectById;
const addMember = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const adminId = req.user.userId;
        const data = schemas_1.projectMemberSchema.parse(req.body);
        await (0, exports.checkProjectAccess)(projectId, adminId, true);
        const userToAdd = await prismaClient_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (!userToAdd) {
            throw new apiError_1.ApiError(404, "User with this email not found", "NOT_FOUND");
        }
        const existingMember = await prismaClient_1.default.projectMember.findUnique({
            where: {
                projectId_userId: { projectId, userId: userToAdd.id },
            },
        });
        if (existingMember) {
            throw new apiError_1.ApiError(400, "User is already a member", "ALREADY_MEMBER");
        }
        const member = await prismaClient_1.default.projectMember.create({
            data: {
                projectId,
                userId: userToAdd.id,
                role: "Member",
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });
        return res.status(201).json(member);
    }
    catch (error) {
        next(error);
    }
};
exports.addMember = addMember;
const removeMember = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const adminId = req.user.userId;
        const userIdToRemove = req.params.userId;
        await (0, exports.checkProjectAccess)(projectId, adminId, true);
        if (adminId === userIdToRemove) {
            throw new apiError_1.ApiError(400, "Cannot remove yourself as Admin from this endpoint", "BAD_REQUEST");
        }
        // Verify member exists
        const memberToRemove = await prismaClient_1.default.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId: userIdToRemove } },
        });
        if (!memberToRemove) {
            throw new apiError_1.ApiError(404, "Member not found in project", "NOT_FOUND");
        }
        // Remove member
        await prismaClient_1.default.projectMember.delete({
            where: { projectId_userId: { projectId, userId: userIdToRemove } },
        });
        // Also unassign tasks assigned to this user in this project
        await prismaClient_1.default.task.updateMany({
            where: {
                projectId,
                assignedTo: userIdToRemove,
            },
            data: {
                assignedTo: null,
            },
        });
        return res.json({ message: "Member removed successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.removeMember = removeMember;
const deleteProject = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const adminId = req.user.userId;
        await (0, exports.checkProjectAccess)(projectId, adminId, true);
        await prismaClient_1.default.project.delete({
            where: { id: projectId },
        });
        return res.json({ message: "Project deleted successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProject = deleteProject;
//# sourceMappingURL=projectController.js.map