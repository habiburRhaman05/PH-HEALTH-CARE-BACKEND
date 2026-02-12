import crypto from "crypto";
import status from "http-status";
import { JwtPayload } from "jsonwebtoken";

import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { redis } from "../../config/redis";
import { tokenUtils } from "../../utils/token";
import { jwtUtils } from "../../utils/jwt";
import { AppError } from "../../utils/AppError";
import { UserStatus } from "../../generated/prisma/enums";
import { envConfig } from "../../config/env";

import type {
  IChangePassword,
  ILoginUserPayload,
  IRegisterPayload,
  IRequestUser,
} from "./auth.interface";
import { PROFILE_CACHE_EXPIRE, REFRESH_EXPIRE, SESSION_EXPIRE } from "../../config/cacheKeys";


const registerPatient = async (payload: IRegisterPayload) => {
  const { user } = await auth.api.signUpEmail({ body: payload });

  try {
    const patient = await prisma.patient.create({
      data: {
        name: user.name,
        email: user.email,
        userId: user.id,
      },
    });

    return { user, patient };
  } catch (error) {
    await prisma.user.delete({ where: { id: user.id } });
    throw error;
  }
};

const loginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;

  const attemptKey = `login_attempt:${email}`;
  const attempts = await redis.incr(attemptKey);

  if (attempts === 1) await redis.expire(attemptKey, 60);
  if (attempts > 5)
    throw new AppError("Too many login attempts", 429);

  const data = await auth.api.signInEmail({ body: { email, password } });

  if (data.user.status === UserStatus.BANNED)
    throw new AppError("User is blocked", status.FORBIDDEN);

  if (data.user.isDeleted)
    throw new AppError("User is deleted", status.NOT_FOUND);

  const tokenPayload = {
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
  };

  const accessToken = tokenUtils.getAccessToken(tokenPayload);
  const refreshToken = tokenUtils.getRefreshToken(tokenPayload);
  const sessionToken = data.token;

  await redis.set(
    `session:${sessionToken}`,
    JSON.stringify(tokenPayload),
    "EX",
    SESSION_EXPIRE
  );

  await redis.set(
    `refresh:${refreshToken}`,
    sessionToken,
    "EX",
    REFRESH_EXPIRE
  );

  await redis.del(attemptKey);

  return { accessToken, refreshToken, sessionToken };
};

const getAllNewTokens = async (
  refreshToken: string,
  sessionToken: string
) => {
  const storedSession = await redis.get(`refresh:${refreshToken}`);

  if (!storedSession || storedSession !== sessionToken)
    throw new AppError("Invalid refresh token", status.UNAUTHORIZED);

  const verified = jwtUtils.verifyToken(
    refreshToken,
    envConfig.REFRESH_TOKEN_SECRET
  );

  if (!verified.success || !verified.data)
    throw new AppError("Invalid refresh token", status.UNAUTHORIZED);

  const payload = verified.data as JwtPayload;

  const tokenPayload = {
    userId: payload.userId,
    role: payload.role,
    name: payload.name,
    email: payload.email,
    status: payload.status,
  };

  const newAccessToken = tokenUtils.getAccessToken(tokenPayload);
  const newRefreshToken = tokenUtils.getRefreshToken(tokenPayload);

  await redis.del(`refresh:${refreshToken}`);

  await redis.set(
    `refresh:${newRefreshToken}`,
    sessionToken,
    "EX",
    REFRESH_EXPIRE
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken,
  };
};

const getUserProfile = async (user: IRequestUser) => {
  const cacheKey = `profile:${user.userId}`;

  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const baseUser = await prisma.user.findUnique({
    where: { id: user.userId },
  });

  if (!baseUser)
    throw new AppError("User not found", status.NOT_FOUND);

  await redis.set(
    cacheKey,
    JSON.stringify(baseUser),
    "EX",
    PROFILE_CACHE_EXPIRE
  );

  return baseUser;
};

const logoutUser = async (
  sessionToken: string,
  refreshToken: string
) => {
  await redis.del(`session:${sessionToken}`);
  await redis.del(`refresh:${refreshToken}`);
  return true;
};

const changePassword = async (payload: IChangePassword) => {
  const session = await redis.get(
    `session:${payload.sessionToken}`
  );

  if (!session)
    throw new AppError("Session expired", status.UNAUTHORIZED);

  const updatedUser = await auth.api.changePassword({
    headers: new Headers({
      Authorization: `Bearer ${payload.sessionToken}`,
    }),
    body: {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    },
  });

  return updatedUser;
};

const requestResetPassword = async (email: string) => {
  const response = await auth.api.requestPasswordReset({
    body: { email },
  });

  if (!response.status)
    throw new AppError("Failed to request reset", 400);

  return true;
};

const resetPassword = async (
  newPassword: string,
  token: string
) => {
  const response = await auth.api.resetPassword({
    body: { token, newPassword },
  });

  if (!response.status)
    throw new AppError("Failed to reset password", 400);

  return true;
};

const verifyEmail = async (token: string) => {
 try {
  await auth.api.verifyEmail({
  query:{
    token
    
  }
  });
  return true;

 } catch (error) {
   throw new AppError("Email verification failed", 400);
 }
};

const googleLoginSuccess = async (
  session: Record<string, any>
) => {
  const existingPatient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  });

  if (!existingPatient) {
    await prisma.patient.create({
      data: {
        userId: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    });
  }

  const tokenPayload = {
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
  };

  const accessToken = tokenUtils.getAccessToken(tokenPayload);
  const refreshToken = tokenUtils.getRefreshToken(tokenPayload);
  const sessionToken = crypto.randomUUID();

  await redis.set(
    `session:${sessionToken}`,
    JSON.stringify(tokenPayload),
    "EX",
    SESSION_EXPIRE
  );

  await redis.set(
    `refresh:${refreshToken}`,
    sessionToken,
    "EX",
    REFRESH_EXPIRE
  );

  return { accessToken, refreshToken, sessionToken };
};

export const authServices = {
  registerPatient,
  loginUser,
  getAllNewTokens,
  getUserProfile,
  logoutUser,
  changePassword,
  requestResetPassword,
  resetPassword,
  googleLoginSuccess,
  verifyEmail
};
