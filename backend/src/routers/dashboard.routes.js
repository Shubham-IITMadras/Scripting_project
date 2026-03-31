import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/stats").get(verifyJWT, verifyAdmin, getDashboardStats);

export default router;
