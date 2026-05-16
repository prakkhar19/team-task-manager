"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const apiError_1 = require("../utils/apiError");
const errorHandler = (err, req, res, next) => {
    if (err instanceof zod_1.ZodError) {
        const errorMessages = err.issues.map((e) => e.message).join(", ");
        return res.status(400).json({
            error: "Validation failed",
            details: err.issues.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            })),
        });
    }
    if (err instanceof apiError_1.ApiError) {
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
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorMiddleware.js.map