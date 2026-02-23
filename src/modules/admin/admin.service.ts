import { ADMIN_LIST_CACHE, adminCacheById, CACHE_TTL, patientCacheById } from "../../config/cacheKeys";
import { redis } from "../../config/redis";
import { UserStatus } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { IChangeUserStatusOrRole, IUpdateAdmin } from "./admin.interface";
import status from "http-status";



const getAllAdminProfile = async () => {
  const cached = await redis.get(ADMIN_LIST_CACHE);
  if (cached) return JSON.parse(cached);

  const admins = await prisma.admin.findMany({
    where: { isDeleted: false },
    include: { user: true },
  });

  await redis.set(
    ADMIN_LIST_CACHE,
    JSON.stringify(admins),
    "EX",
    CACHE_TTL
  );

  return admins;
};

const getAdminById = async (id: string) => {
  const cacheKey = `${adminCacheById(id)}`;

  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const admin = await prisma.admin.findUnique({
    where: { id, isDeleted: false },
    include: { user: true },
  });

  if (!admin) {
    throw new AppError(
      "Admin Or Super Admin not found",
      status.NOT_FOUND
    );
  }

  await redis.set(cacheKey, JSON.stringify(admin), "EX", CACHE_TTL);

  return admin;
};

const updateAdminProfile = async (payload: IUpdateAdmin) => {
  const { admidId: id, admin, user } = payload;

  const existingAdmin = await prisma.admin.findUnique({ where: { id } });

  if (!existingAdmin) {
    throw new AppError("Admin Or Super Admin not found", status.NOT_FOUND);
  }

  await prisma.user.update({
    where: { id: existingAdmin.userId },
    data: { ...user },
  });

  const updatedAdmin = await prisma.admin.update({
    where: { id },
    data: { ...admin },
    include: { user: true },
  });

  await redis.del(adminCacheById(id));
  await redis.del(ADMIN_LIST_CACHE);

  return updatedAdmin;
};

const deleteAdminProfile = async (
  id: string,
  user: { userId: string }
) => {
  const existing = await prisma.admin.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(
      "Admin Or Super Admin not found",
      status.NOT_FOUND
    );
  }

  if (existing.userId === user.userId) {
    throw new AppError(
      "You cannot delete yourself",
      status.BAD_REQUEST
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.admin.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: existing.userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });

    await tx.session.deleteMany({
      where: { userId: existing.userId },
    });

    await tx.account.deleteMany({
      where: { userId: existing.userId },
    });

    return true;
  });

  await redis.del(adminCacheById(id));
  await redis.del(ADMIN_LIST_CACHE);

  return result;
};
const changeUserStatusOrRole = async (

  payload:IChangeUserStatusOrRole
) => {
  const {userId,role,status:userStatus} = payload
  // check is user exist
  const existing = await prisma.user.findUnique({
    where: { id:userId },
  });

  if (!existing) {
    throw new AppError(
      "mr Admin your expected user not found",
      status.NOT_FOUND
    );
  }
  const updatedQuery = {
   status:userStatus || existing.status,
   role:role || existing.role,
  }

  const updatedUser = await prisma.user.update({
    where:{id:userId},
    data:updatedQuery
  })


  await redis.del(patientCacheById(userId));
  await redis.del(ADMIN_LIST_CACHE);

  return updatedUser
};

export const adminServices = {
  getAdminById,
  getAllAdminProfile,
  updateAdminProfile,
  deleteAdminProfile,
  changeUserStatusOrRole
};
