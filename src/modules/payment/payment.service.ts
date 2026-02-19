
import { AppointmentStatus, PaymentStatus } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";



const handlePaymentSuccess = async (appointmentId: string) => {
  //  Fetch appointment with payment relation
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { payment: true },
  });

  if (!appointment) {
    throw new AppError( "Appointment not found",404);
  }

  //  Idempotency check (VERY IMPORTANT)
  if (appointment.paymentStatus === PaymentStatus.COMPLETE) {
    return {
      message: "Payment already processed",
      appointment,
    };
  }

  //  State validation
  if (appointment.status !== AppointmentStatus.PENDING) {
    throw new AppError(
      
      `Invalid appointment state: ${appointment.status}`,
      400
    );
  }

  if (!appointment.payment) {
    throw new AppError( "Payment record not found",400);
  }

  //  Atomic Transaction
  const result = await prisma.$transaction(async (tx) => {
    const updatedAppointment = await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: PaymentStatus.COMPLETE,
        status: AppointmentStatus.SCHEDULED,
      },
    });

    const updatedPayment = await tx.payment.update({
      where: { id: appointment.payment?.id! },
      data: {
        status: PaymentStatus.COMPLETE,
        updatedAt: new Date(),
      },
    });

    return {
      appointment: updatedAppointment,
      payment: updatedPayment,
    };
  });

  return result;
};

export const paymentServices = {
  handlePaymentSuccess,
};
