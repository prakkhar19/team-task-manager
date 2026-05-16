"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const errorMiddleware_1 = require("./middlewares/errorMiddleware");
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
}));
// Rate Limiting on Auth routes (max 10 requests/15 min per IP)
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Too many requests, please try again later", code: "RATE_LIMIT" },
});
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/login", authLimiter);
// API Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/projects", projectRoutes_1.default);
app.use("/api/dashboard", dashboardRoutes_1.default);
// Serve Frontend in Production
if (process.env.NODE_ENV === "production") {
    const frontendPath = path_1.default.join(__dirname, "../../frontend/dist");
    app.use(express_1.default.static(frontendPath));
    app.get("*", (req, res) => {
        res.sendFile(path_1.default.join(frontendPath, "index.html"));
    });
}
else {
    app.get("/", (req, res) => {
        res.send("Team Task Manager API is running...");
    });
}
// Global Error Handler
app.use(errorMiddleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map