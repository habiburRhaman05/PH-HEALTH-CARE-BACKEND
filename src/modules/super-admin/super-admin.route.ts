
import { Router } from "express";
import { superAdminControllers } from "./super-admin.controller";
import { authMiddleware, roleMiddleware } from "../../middleware/auth-middlewares";


const router = Router();

router.get("/",
     authMiddleware,
     roleMiddleware(['SUPER_ADMIN',"ADMIN"]),
    superAdminControllers.getAllSuperAdminsController);
router.get("/:id",
     authMiddleware,
     roleMiddleware(['SUPER_ADMIN',"ADMIN"]),
    superAdminControllers.getSuperAdminByIdController);
router.put("/:id",
     authMiddleware,
     roleMiddleware(['SUPER_ADMIN']),
    superAdminControllers.updateSuperAdminController);

export default router;
