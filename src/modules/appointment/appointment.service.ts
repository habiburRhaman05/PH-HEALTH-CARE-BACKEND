import status from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { ICreateAppointmentPayload } from "./appointment.interface";
import { AppointmentStatus } from "../../generated/prisma/enums";

//
// ===============================
// GET ALL APPOINTMENTS
// ===============================
//
const getAllAppointments = async () => {
  const appointments = await prisma.appointment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      patient: true,
      doctor: true,
      schedule: true,
    },
  });

  return appointments;
};

//
// ===============================
// CREATE APPOINTMENT
// ===============================
//
const createAppointment = async (payload: ICreateAppointmentPayload) => {
  const { doctorId, patientId, scheduleId } = payload;
  return await prisma.$transaction(async (tx) => {
    // 1️⃣ Check Doctor
    const doctor = await tx.doctor.findUnique({
      where: { id: doctorId, isDeleted: false },
    });

    if (!doctor) {
      throw new AppError("Doctor profile not found", status.NOT_FOUND);
    }

    // 2️⃣ Check Patient
    const patient = await tx.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new AppError("Patient profile not found", status.NOT_FOUND);
    }

    // 3️⃣ Check Schedule Availability
    const doctorSchedule = await tx.doctorSchedules.findUnique({
      where: {
        doctorId_scheduleId: {
          doctorId,
          scheduleId,
        },
      },
    });

    if (!doctorSchedule) {
      throw new AppError("Schedule not found for this doctor", status.NOT_FOUND);
    }

    if (doctorSchedule.isBooked) {
      throw new AppError("This schedule is already booked", status.BAD_REQUEST);
    }

    // 4️⃣ Create Appointment
    const appointment = await tx.appointment.create({
      data: {
        ...payload,
        status: AppointmentStatus.SCHEDULED,
      },
      include: {
        patient: true,
        doctor: true,
        schedule: true,
      },
    });

    // 5️⃣ Mark Schedule as Booked
    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId,
          scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });

    return appointment;
  });
};

//
// ===============================
// GET APPOINTMENT BY ID
// ===============================
//
const getAppointmentById = async (id: string) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: true,
      schedule: true,
      prescription: true,
      review: true,
      payment: true,
    },
  });

  if (!appointment) {
    throw new AppError("Appointment not found", status.NOT_FOUND);
  }

  return appointment;
};

//
// ===============================
// CANCEL APPOINTMENT
// ===============================
//
const cancelAppointment = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new AppError("Appointment not found", status.NOT_FOUND);
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new AppError("Appointment already cancelled", status.BAD_REQUEST);
    }

    // 1️⃣ Update Appointment Status
    const updatedAppointment = await tx.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
      },
    });

    // 2️⃣ Free Schedule
    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: appointment.doctorId,
          scheduleId: appointment.scheduleId,
        },
      },
      data: {
        isBooked: false,
      },
    });

    return updatedAppointment;
  });
};

export const appointmentServices = {
  getAllAppointments,
  createAppointment,
  getAppointmentById,
  cancelAppointment,
};
