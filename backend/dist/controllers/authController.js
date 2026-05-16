"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = __importDefault(require("../prismaClient"));
const schemas_1 = require("../schemas");
const apiError_1 = require("../utils/apiError");
const emailService_1 = require("../utils/emailService");
const register = async (req, res, next) => {
    try {
        const data = schemas_1.registerSchema.parse(req.body);
        const existingUser = await prismaClient_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new apiError_1.ApiError(400, "Email already exists", "USER_EXISTS");
        }
        const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
        const user = await prismaClient_1.default.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
            },
        });
        // Send welcome email asynchronously
        (0, emailService_1.sendWelcomeEmail)(user.email, user.name);
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        return res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const data = schemas_1.loginSchema.parse(req.body);
        const user = await prismaClient_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            throw new apiError_1.ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
        }
        const isMatch = await bcrypt_1.default.compare(data.password, user.password);
        if (!isMatch) {
            throw new apiError_1.ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = (req, res) => {
    res.clearCookie("token");
    return res.json({ message: "Logged out successfully" });
};
exports.logout = logout;
const getMe = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            throw new apiError_1.ApiError(401, "Not authenticated");
        const user = await prismaClient_1.default.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true },
        });
        if (!user)
            throw new apiError_1.ApiError(404, "User not found");
        return res.json(user);
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
//# sourceMappingURL=authController.js.map