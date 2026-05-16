import { z } from "zod";
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const projectSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const projectMemberSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
export declare const taskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        "To Do": "To Do";
        "In Progress": "In Progress";
        Done: "Done";
    }>>;
    priority: z.ZodOptional<z.ZodEnum<{
        Low: "Low";
        Medium: "Medium";
        High: "High";
    }>>;
    dueDate: z.ZodOptional<z.ZodString>;
    assignedTo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const updateTaskSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        "To Do": "To Do";
        "In Progress": "In Progress";
        Done: "Done";
    }>>;
    priority: z.ZodOptional<z.ZodEnum<{
        Low: "Low";
        Medium: "Medium";
        High: "High";
    }>>;
    dueDate: z.ZodOptional<z.ZodString>;
    assignedTo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
//# sourceMappingURL=index.d.ts.map