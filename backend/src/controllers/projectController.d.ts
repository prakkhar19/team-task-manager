import { Request, Response, NextFunction } from "express";
export declare const checkProjectAccess: (projectId: string, userId: string, requireAdmin?: boolean) => Promise<{
    id: string;
    projectId: string;
    userId: string;
    role: string;
    joinedAt: Date;
}>;
export declare const createProject: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const getProjects: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const getProjectById: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const addMember: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const removeMember: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const deleteProject: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=projectController.d.ts.map