import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { envConfig } from "../config/env";

export type UserRole = "STUDENT" | "TUTOR" | "ADMIN";

export interface AuthTokenPayload extends JwtPayload {
  userId: string;
  role: UserRole;
}

const JWT_SECRET = envConfig.JWT_SECRET;
const DEFAULT_EXPIRES_IN: SignOptions["expiresIn"] = "1d";

const resolveExpiresIn = (): SignOptions["expiresIn"] => {
  const raw = process.env.JWT_EXPIRES_IN;
  if (!raw) return DEFAULT_EXPIRES_IN;

  const trimmed = raw.trim();
  if (!trimmed) return DEFAULT_EXPIRES_IN;
  return trimmed as SignOptions["expiresIn"];
};

export const signAccessToken = (
  payload: AuthTokenPayload,
  options: SignOptions = {}
): string => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  if (!payload?.userId || !payload?.role) {
    throw new Error("Token payload must include userId and role.");
  }

  const expiresIn: SignOptions["expiresIn"] = options.expiresIn ?? resolveExpiresIn();
  return jwt.sign(payload, JWT_SECRET, { ...options, expiresIn });
};

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  if (!token) {
    throw new Error("Token is required for verification.");
  }

  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
};
