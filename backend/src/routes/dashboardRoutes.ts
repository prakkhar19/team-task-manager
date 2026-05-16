import { Router } from "express";
import { getDashboard } from "../controllers/dashboardController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.use(requireAuth);
router.get("/", getDashboard);

export default router;
