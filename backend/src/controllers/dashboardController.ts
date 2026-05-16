import { Request, Response, NextFunction } from "express";
import prisma from "../prismaClient";

interface CacheEntry {
  data: any;
  timestamp: number;
}
const cache: Record<string, CacheEntry> = {};
const CACHE_TTL = 60 * 1000; // 60 seconds

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    // Check cache
    const cached = cache[userId];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }

    // Determine if user is Admin in ANY project
    const adminProjects = await prisma.projectMember.findMany({
      where: { userId, role: "Admin" },
      select: { projectId: true },
    });
    const isAdmin = adminProjects.length > 0;
    const adminProjectIds = adminProjects.map((p) => p.projectId);

    // Fetch tasks where user is assigned or creator
    const userTasks = await prisma.task.findMany({
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
    const overdueTasks: typeof userTasks = [];
    const now = new Date();

    userTasks.forEach((task) => {
      if (tasksByStatus[task.status as keyof typeof tasksByStatus] !== undefined) {
        tasksByStatus[task.status as keyof typeof tasksByStatus]++;
      }
      if (task.dueDate && new Date(task.dueDate) < now && task.status !== "Done") {
        overdueTasks.push(task);
      }
    });

    // Project summary
    const userProjects = await prisma.project.findMany({
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
    let tasksByUser: Record<string, number> | null = null;
    if (isAdmin) {
      // Find all tasks in projects where user is Admin
      const tasksInAdminProjects = await prisma.task.findMany({
        where: { projectId: { in: adminProjectIds }, assignedTo: { not: null } },
        include: { assignee: { select: { name: true } } },
      });

      tasksByUser = {};
      tasksInAdminProjects.forEach((task) => {
        const name = task.assignee!.name;
        tasksByUser![name] = (tasksByUser![name] || 0) + 1;
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
  } catch (error) {
    next(error);
  }
};
