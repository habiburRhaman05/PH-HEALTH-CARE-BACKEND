
import { Router } from "express";

import { validateRequest } from "../../middleware/validateRequest";
import { authControllers } from "./auth.controller";
import { authSchemas } from "./auth.schema";

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
export default router;
