import { prisma } from "../../lib/prisma";
import { redis } from "../../config/redis";
import status from "http-status";
import { AppError } from "../../utils/AppError";
import { DoctorQueryParams } from "./doctor.interface";
import { doctorCacheById } from "../../config/cacheKeys";


const getDoctorById = async (id: string) => {
  const cacheKey = doctorCacheById(id);

  const cachedDoctor = await redis.get(cacheKey);
  if (cachedDoctor) {
    return JSON.parse(cachedDoctor);
  }

  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      specialty: {
        include: {
          specialty: {
            select: {
              id: true,
              title: true,
              icon: true,
            },
          },
        },
      },
      reviews: true,
      schedule: true,
    },
  });

  if (!doctor) {
    throw new AppError("Doctor not found", status.NOT_FOUND);
  }

  const formattedDoctor = {
    ...doctor,
    doctorSpecialties: doctor.specialty.map((item) => ({
      id: item.specialty.id,
      title: item.specialty.title,
      icon: item.specialty.icon,
    })),
  };

  delete (formattedDoctor as any).specialty;

  await redis.set(cacheKey, JSON.stringify(formattedDoctor), "EX", 300);

  return formattedDoctor;
};

const getAllDoctors = async (query: DoctorQueryParams) => {
  const { page = "1", limit = "10", searchTerm, specialty, minFee, maxFee } =
    query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const cacheKey = `doctors:${JSON.stringify(query)}`;

  const cachedDoctors = await redis.get(cacheKey);
  if (cachedDoctors) {
    return JSON.parse(cachedDoctors);
  }

  const filters: any = {
    isDeleted: false,
  };

  if (searchTerm) {
    filters.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { designation: { contains: searchTerm, mode: "insensitive" } },
      { qualification: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  if (minFee || maxFee) {
    filters.appointmentFee = {};
    if (minFee) filters.appointmentFee.gte = Number(minFee);
    if (maxFee) filters.appointmentFee.lte = Number(maxFee);
  }

  if (specialty) {
    filters.specialty = {
      some: {
        specialty: {
          title: {
            contains: specialty,
            mode: "insensitive",
          },
        },
      },
    };
  }

  const [doctors, total] = await Promise.all([
    prisma.doctor.findMany({
      where: filters,
      skip,
      take: limitNumber,
      orderBy: { createdAt: "desc" },
      include: {
        specialty: {
          include: {
            specialty: {
              select: {
                id: true,
                title: true,
                icon: true,
              },
            },
          },
        },
      },
    }),
    prisma.doctor.count({ where: filters }),
  ]);

  const formattedDoctors = doctors.map((doctor) => {
    const doctorSpecialties = doctor.specialty.map((item) => ({
      id: item.specialty.id,
      title: item.specialty.title,
      icon: item.specialty.icon,
    }));

    return {
      ...doctor,
      doctorSpecialties,
    };
  });

  formattedDoctors.forEach((doc: any) => delete doc.specialty);

  const result = {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
    data: formattedDoctors,
  };

  await redis.set(cacheKey, JSON.stringify(result), "EX", 300);

  return result;
};

const updateDoctor = async (id: string, payload: any) => {
  const doctorExists = await prisma.doctor.findUnique({
    where: { id },
  });

  if (!doctorExists) {
    throw new AppError("Doctor not found", status.NOT_FOUND);
  }

  const updatedDoctor = await prisma.doctor.update({
    where: { id },
    data: payload,
  });

  await redis.del(doctorCacheById(id));

  return updatedDoctor;
};

const deleteDoctor = async (id: string) => {
  const doctorExists = await prisma.doctor.findUnique({
    where: { id },
  });

  if (!doctorExists) {
    throw new AppError("Doctor not found", status.NOT_FOUND);
  }

  await prisma.doctor.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  });

  await redis.del(doctorCacheById(id));

};

export const doctorServices = {
  getDoctorById,
  getAllDoctors,
  updateDoctor,
  deleteDoctor,
};
