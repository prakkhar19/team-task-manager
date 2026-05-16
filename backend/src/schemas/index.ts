import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string(),
});

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
});

export const projectMemberSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(1000).optional(),
  status: z.enum(["To Do", "In Progress", "Done"]).optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  dueDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date" })
    .refine((date) => new Date(date) > new Date(), { message: "Due date must be in the future" })
    .optional(),
  assignedTo: z.string().uuid().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(["To Do", "In Progress", "Done"]).optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  dueDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date" })
    .optional(), // Do not strictly enforce future on update since it might just be untouched
  assignedTo: z.string().uuid().optional().nullable(),
});
