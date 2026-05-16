"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const apiError_1 = require("../utils/apiError");
const requireAuth = (req, res, next) => {
    try {
        let token = req.cookies.token;
        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            throw new apiError_1.ApiError(401, "Authentication required", "UNAUTHORIZED");
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        next(new apiError_1.ApiError(401, "Invalid or expired token", "UNAUTHORIZED"));
    }
};
exports.requireAuth = requireAuth;
//# sourceMappingURL=authMiddleware.js.map