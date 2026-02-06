import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { hashPassword, verifyPassword } from "../../utils/bcrypt";
import { signAccessToken } from "../../utils/jwt";
import type { LoginPayload, RegisterPayload } from "./types";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

// -------------------- REGISTER --------------------
const registerUser = async (payload: RegisterPayload) => {
  const email = payload.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  const passwordHash = await hashPassword(payload.password);

  const user = await prisma.user.create({
    data: {
      name: payload.name.trim(),
      email,
      passwordHash,
      role: payload.role ?? "STUDENT",
    },
    select: publicUserSelect,
  });

  const token = signAccessToken({ userId: user.id, role: user.role });

  return { user, token };
};

// -------------------- LOGIN --------------------
const loginUser = async (payload: LoginPayload) => {
  const email = payload.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await verifyPassword(payload.password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const { passwordHash: _passwordHash, ...safeUser } = user;
  const token = signAccessToken({ userId: user.id, role: user.role });

  return { user: safeUser, token };
};

export const authServices = { registerUser, loginUser };
