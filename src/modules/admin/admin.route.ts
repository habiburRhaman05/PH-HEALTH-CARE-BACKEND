import { Router } from "express";
import { authMiddleware, roleMiddleware } from "../../middleware/auth-middlewares";
import { UserRole } from "../../generated/prisma/enums";
import { adminControllers } from "./admin.controller";
import { adminSchemas } from "./admin.schema";
import { validateRequest } from "../../middleware/validateRequest";

const router = Router();

router.get("/",
    authMiddleware,
    roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
    adminControllers.getAllAdminController);

router.get("/:id",
    authMiddleware,
    roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
    adminControllers.getAdminByIdController);
router.put("/:id",
    authMiddleware,
    roleMiddleware([UserRole.SUPER_ADMIN]),
    validateRequest(adminSchemas.updateAdminZodSchema),
    adminControllers.updateAdminController
);
router.delete("/:id",
    authMiddleware,
    roleMiddleware([UserRole.SUPER_ADMIN]),
    adminControllers.deleteAdminController
);

export const AdminRoutes = router;