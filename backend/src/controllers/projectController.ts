import { Request, Response, NextFunction } from "express";
import prisma from "../prismaClient";
import { projectSchema, projectMemberSchema } from "../schemas";
import { ApiError } from "../utils/apiError";

// Middleware helper to check membership and role
export const checkProjectAccess = async (projectId: string, userId: string, requireAdmin = false) => {
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (!member) {
    throw new ApiError(403, "Access denied to this project", "FORBIDDEN");
  }

  if (requireAdmin && member.role !== "Admin") {
    throw new ApiError(403, "Admin access required", "FORBIDDEN");
  }

  return member;
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = projectSchema.parse(req.body);
    const userId = req.user!.userId;

    const project = await prisma.project.create({
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
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const projects = await prisma.project.findMany({
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
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const userId = req.user!.userId;

    await checkProjectAccess(projectId, userId);

    const project = await prisma.project.findUnique({
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
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const adminId = req.user!.userId;
    const data = projectMemberSchema.parse(req.body);

    await checkProjectAccess(projectId, adminId, true);

    const userToAdd = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!userToAdd) {
      throw new ApiError(404, "User with this email not found", "NOT_FOUND");
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: userToAdd.id },
      },
    });

    if (existingMember) {
      throw new ApiError(400, "User is already a member", "ALREADY_MEMBER");
    }

    const member = await prisma.projectMember.create({
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
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const adminId = req.user!.userId;
    const userIdToRemove = req.params.userId as string;

    await checkProjectAccess(projectId, adminId, true);

    if (adminId === userIdToRemove) {
      throw new ApiError(400, "Cannot remove yourself as Admin from this endpoint", "BAD_REQUEST");
    }

    // Verify member exists
    const memberToRemove = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: userIdToRemove } },
    });

    if (!memberToRemove) {
      throw new ApiError(404, "Member not found in project", "NOT_FOUND");
    }

    // Remove member
    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId: userIdToRemove } },
    });

    // Also unassign tasks assigned to this user in this project
    await prisma.task.updateMany({
      where: {
        projectId,
        assignedTo: userIdToRemove,
      },
      data: {
        assignedTo: null,
      },
    });

    return res.json({ message: "Member removed successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const adminId = req.user!.userId;

    await checkProjectAccess(projectId, adminId, true);

    await prisma.project.delete({
      where: { id: projectId },
    });

    return res.json({ message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
};
