"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskSchema = exports.taskSchema = exports.projectMemberSchema = exports.projectSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters").max(100),
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string(),
});
exports.projectSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required").max(100),
    description: zod_1.z.string().max(500).optional(),
});
exports.projectMemberSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
});
exports.taskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required").max(100),
    description: zod_1.z.string().max(1000).optional(),
    status: zod_1.z.enum(["To Do", "In Progress", "Done"]).optional(),
    priority: zod_1.z.enum(["Low", "Medium", "High"]).optional(),
    dueDate: zod_1.z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date" })
        .refine((date) => new Date(date) > new Date(), { message: "Due date must be in the future" })
        .optional(),
    assignedTo: zod_1.z.string().uuid().optional().nullable(),
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().max(1000).optional(),
    status: zod_1.z.enum(["To Do", "In Progress", "Done"]).optional(),
    priority: zod_1.z.enum(["Low", "Medium", "High"]).optional(),
    dueDate: zod_1.z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date" })
        .optional(), // Do not strictly enforce future on update since it might just be untouched
    assignedTo: zod_1.z.string().uuid().optional().nullable(),
});
//# sourceMappingURL=index.js.map