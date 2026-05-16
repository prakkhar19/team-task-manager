import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/apiError";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    const errorMessages = err.issues.map((e) => e.message).join(", ");
    return res.status(400).json({
      error: "Validation failed",
      details: err.issues.map((e: any) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    error: "Internal Server Error",
    code: "INTERNAL_ERROR",
  });
};
