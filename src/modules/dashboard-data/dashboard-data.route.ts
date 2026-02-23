import { Router } from "express";
import { authMiddleware } from "../../middleware/auth-middlewares";
import { dashboardControllers } from "./dashboard-data.controller";

const dashboardDataRouter = Router();

dashboardDataRouter.get("/",authMiddleware,dashboardControllers.getAdminDashboardData)

export default dashboardDataRouter