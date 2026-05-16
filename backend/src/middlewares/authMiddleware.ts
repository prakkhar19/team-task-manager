import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies.token;
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new ApiError(401, "Authentication required", "UNAUTHORIZED");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      email: string;
    };

    req.user = decoded;
    next();
  } catch (err) {
    next(new ApiError(401, "Invalid or expired token", "UNAUTHORIZED"));
  }
};
