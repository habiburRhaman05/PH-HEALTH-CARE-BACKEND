
import { prisma } from "../../lib/prisma";
import { redis } from "../../config/redis";
import status from "http-status";
import { AppError } from "../../utils/AppError";
import { IUpdateAdmin } from "../admin/admin.interface";
import { adminCacheById } from "../../config/cacheKeys";

const SUPER_ADMIN_LIST_CACHE = "super-admins-list";
const CACHE_TTL = 300; // 5 minutes

// GET ALL SUPER ADMINS
const getAllSuperAdmins = async () => {
    //  Check cache
    const cached = await redis.get(SUPER_ADMIN_LIST_CACHE);
    if (cached) return JSON.parse(cached);

    //  Fetch from DB
    const superAdmins = await prisma.user.findMany({
        where: { role: "SUPER_ADMIN", isDeleted: false },
        include: { admin: true },
    });

    //  Save to Redis
    await redis.set(SUPER_ADMIN_LIST_CACHE, JSON.stringify(superAdmins), "EX", CACHE_TTL);

    return superAdmins;
};

// GET SUPER ADMIN BY ID
const getSuperAdminById = async (id: string) => {
    const superAdmin = await prisma.user.findUnique({
        where: { id },
        include: { admin: true },
    });

    if (!superAdmin || superAdmin.role !== "SUPER_ADMIN") {
        throw new AppError("Super Admin not found", status.NOT_FOUND);
    }

    return superAdmin;
};

// UPDATE SUPER ADMIN
const updateSuperAdminProfile = async (payload: IUpdateAdmin) => {
    const { admidId: id, admin, user } = payload;

    const existingAdmin = await prisma.admin.findUnique({ where: { id } });

    if (!existingAdmin) {
        throw new AppError("Admin Or Super Admin not found", status.NOT_FOUND);
    }

    await prisma.user.update({
        where: { id: existingAdmin.userId, role: "SUPER_ADMIN" },
        data: { ...user },
    });

    const updatedAdmin = await prisma.admin.update({
        where: { id },
        data: { ...admin },
        include: { user: true },
    });

    await redis.del(adminCacheById(id));
    await redis.del(SUPER_ADMIN_LIST_CACHE);

    return updatedAdmin;
};



export const superAdminServices = {
    getAllSuperAdmins,
    getSuperAdminById,
    updateSuperAdminProfile,
};
