import { Request, Response, NextFunction } from "express";
import prisma from "../prismaClient";
import { taskSchema, updateTaskSchema } from "../schemas";
import { ApiError } from "../utils/apiError";
import { checkProjectAccess } from "./projectController";

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const adminId = req.user!.userId;
    const data = taskSchema.parse(req.body);

    await checkProjectAccess(projectId, adminId, true);

    if (data.assignedTo) {
      const isMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: data.assignedTo } },
      });
      if (!isMember) {
        throw new ApiError(400, "Assigned user must be a member of the project", "INVALID_ASSIGNEE");
      }
    }

    const task = await prisma.task.create({
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
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const userId = req.user!.userId;

    await checkProjectAccess(projectId, userId);

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const taskId = req.params.taskId as string;
    const userId = req.user!.userId;

    await checkProjectAccess(projectId, userId);

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    if (!task) {
      throw new ApiError(404, "Task not found", "NOT_FOUND");
    }

    return res.json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const taskId = req.params.taskId as string;
    const userId = req.user!.userId;
    const data = updateTaskSchema.parse(req.body);

    const member = await checkProjectAccess(projectId, userId);

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
    });

    if (!task) {
      throw new ApiError(404, "Task not found", "NOT_FOUND");
    }

    if (member.role === "Member") {
      // Member can only update status of their own assigned tasks
      if (task.assignedTo !== userId) {
        throw new ApiError(403, "Members can only update their own assigned tasks", "FORBIDDEN");
      }
      
      const allowedFields = Object.keys(data);
      if (allowedFields.length > 1 || (allowedFields.length === 1 && allowedFields[0] !== "status")) {
        throw new ApiError(403, "Members can only update task status", "FORBIDDEN");
      }
    } else {
      // Admin updating assignedTo
      if (data.assignedTo !== undefined && data.assignedTo !== null) {
        const isAssigneeMember = await prisma.projectMember.findUnique({
          where: { projectId_userId: { projectId, userId: data.assignedTo } },
        });
        if (!isAssigneeMember) {
          throw new ApiError(400, "Assigned user must be a member of the project", "INVALID_ASSIGNEE");
        }
      }
    }

    // Status transition validation
    if (data.status && data.status !== task.status) {
      const validTransitions: Record<string, string[]> = {
        "To Do": ["In Progress"],
        "In Progress": ["Done", "To Do"], // Allowing back to To Do just in case, but strictly maybe just forward? "transitions must follow: 'To Do' -> 'In Progress' -> 'Done' (enforce strictly)"
        "Done": ["In Progress"], // Allowing back to in progress
      };

      // Let's enforce strict one-way or adjacent transitions based on prompt: "status transitions must follow: 'To Do' -> 'In Progress' -> 'Done' (enforce strictly)"
      const strictTransitions: Record<string, string[]> = {
        "To Do": ["In Progress"],
        "In Progress": ["Done"],
        "Done": [],
      };
      
      if (!strictTransitions[task.status].includes(data.status)) {
        throw new ApiError(400, `Invalid status transition from ${task.status} to ${data.status}`, "INVALID_TRANSITION");
      }
    }

    const updatedTask = await prisma.task.update({
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
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const taskId = req.params.taskId as string;
    const adminId = req.user!.userId;

    await checkProjectAccess(projectId, adminId, true);

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
    });

    if (!task) {
      throw new ApiError(404, "Task not found", "NOT_FOUND");
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return res.json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};
