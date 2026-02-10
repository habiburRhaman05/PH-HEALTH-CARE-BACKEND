
import { Router } from "express";

import { validateRequest } from "../../middleware/validateRequest";
import { authControllers } from "./auth.controller";
import { authSchemas } from "./auth.schema";
import { authMiddleware } from "../../middleware/auth-middlewares";

const router: Router = Router();

router.post(
  "/register",
  validateRequest(authSchemas.registerUserSchema),
  authControllers.registerController
);

router.post(
  "/login",
  validateRequest(authSchemas.loginUserSchema),
  authControllers.loginController
);
router.get(
  "/me",
authMiddleware,
  authControllers.getUserProfileController
);
router.get(
  "/logout",
authMiddleware,
  authControllers.logoutUserController
);
router.put(
  "/change-password",
authMiddleware,
validateRequest(authSchemas.changePasswordSchema),
  authControllers.changePasswordController
);
export default router;
