import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { authServices } from "./auth.service";
import { CookieUtils } from "../../utils/cookie";
import { tokenUtils } from "../../utils/token";
import { envConfig } from "../../config/env";
import status from "http-status"
import { AppError } from "../../utils/AppError";
const isProduction = envConfig.NODE_ENV === "production";

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
// -------------------- PROFILE DATA --------------------
const getUserProfileController = asyncHandler(async (req: Request, res: Response) => {

  const user = await authServices.getUserProfile(res.locals.auth)
  return sendSuccess(res, {
    data: user,
    message: "Profile Data fetch Successfully"
  })
});
// -------------------- LOGOUT --------------------
const logoutUserController = asyncHandler(async (req: Request, res: Response) => {

  const authToken = req.headers.authorization?.split(" ")[1]
  const better_auth_session_token = req.cookies["better-auth.session_token"]
 
  const user = await authServices.logoutUser(better_auth_session_token||authToken!)
     CookieUtils.clearCookie(res, "accessToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: '/',
        maxAge: 15 * 60 * 1000,
    })
    CookieUtils.clearCookie(res, "refreshToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    CookieUtils.clearCookie(res, "better-auth.session_token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
    })
  return sendSuccess(res, {
    statusCode:200,
    data: user,
    message: "User Logout Successfully"
  })
});
// -------------------- CHANGE PASSWORD --------------------
const changePasswordController = asyncHandler(async (req: Request, res: Response) => {

  const authToken = req.headers.authorization?.split(" ")[1]
 
  const better_auth_session_token = req.cookies["better-auth.session_token"];

  const {currentPassword,newPassword} = req.body

  const user = await authServices.changePassword({
    sessionToken:better_auth_session_token || authToken!,
    currentPassword,
    newPassword
  })
 
  return sendSuccess(res, {
    statusCode:200,
    data: user,
    message: "Password change Successfully"
  })
});

export const authControllers = { registerController, loginController, getUserProfileController,logoutUserController,
  changePasswordController
 };
