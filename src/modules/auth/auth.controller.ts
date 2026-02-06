import type { Request, Response } from "express";
import { authServices } from "./auth.service";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

// -------------------- REGISTER --------------------
const registerController = asyncHandler(async (req: Request, res: Response) => {
  const result = await authServices.registerUser(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: "User registered successfully",
    data: result,
  });
});

// -------------------- LOGIN --------------------
const loginController = asyncHandler(async (req: Request, res: Response) => {
  const result = await authServices.loginUser(req.body);
  return sendSuccess(res, {
    message: "Login successful",
    data: result,
  });
});

export const authControllers = { registerController, loginController };
