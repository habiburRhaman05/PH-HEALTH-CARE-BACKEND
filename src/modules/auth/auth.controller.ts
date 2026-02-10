import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { authServices } from "./auth.service";
import { CookieUtils } from "../../utils/cookie";
import { tokenUtils } from "../../utils/token";

// -------------------- REGISTER --------------------
const registerController = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const result = await authServices.registerPatient({
    name, email, password
  })
  return sendSuccess(res, {
    statusCode: 201,
    data: result,
    message: " Patient Account Created Successfully"
  })
});

// -------------------- LOGIN --------------------
const loginController = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  ;


  // common approse with accesstoken and refreshtoken

  const data = await authServices.loginUser({ email, password })

  tokenUtils.setAccessTokenCookie(res, data.accessToken)
  tokenUtils.setRefreshTokenCookie(res, data.refreshToken)
  tokenUtils.setBetterAuthSessionCookie(res, data.token)
  // handle cookie with better-auth custom route 
  // const response = await authServices.loginUser({email,password})
  // const setCookie = response.headers.get("set-cookie");

  // if (setCookie) {
  //   res.setHeader("set-cookie", setCookie);
  // }

  // // 4. Return the user/data as JSON
  // const data = await response.json();
  return sendSuccess(res, {
    statusCode: 200,
    data,
    message: "your are LoggedIn Sucessfully"
  })
});
// -------------------- LOGIN --------------------
const getUserProfileController = asyncHandler(async (req: Request, res: Response) => {

  const user = await authServices.getUserProfile(res)
  return sendSuccess(res, {
    data: user,
    message: "Profile Data fetch Successfully"
  })
});

export const authControllers = { registerController, loginController, getUserProfileController };
