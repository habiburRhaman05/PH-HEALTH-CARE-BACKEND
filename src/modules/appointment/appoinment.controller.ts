import { Request, Response } from "express";
import status from "http-status";

import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../utils/asyncHandler";
import { appointmentServices } from "./appointment.service";
import { sendSuccess } from "../../utils/apiResponse";
import { v7 as uuidv7 } from "uuid";


const getAllAppointments = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await appointmentServices.getAllAppointments(req.query as any);

    sendSuccess(res, {
      statusCode: status.OK,
      message: "Appointments fetched successfully",
      data: result,
    });
  }
);


const getAppointmentById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError("Appointment ID is required", status.BAD_REQUEST);
    }

    const result = await appointmentServices.getAppointmentById(id as string);

    sendSuccess(res, {
      statusCode: status.OK,
      message: "Appointment fetched successfully",
      data: result,
    });
  }
);


const createAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = req.body;
     payload.videoCallingId = String(uuidv7())

    const result = await appointmentServices.createAppointment(payload);

    sendSuccess(res, {
      statusCode: status.CREATED,
      message: "Appointment created successfully",
      data: result,
    });
  }
);
const createAppointmentWithPayLater = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = req.body;
     payload.videoCallingId = String(uuidv7())

    const result = await appointmentServices.createAppointmentWithPaylater(payload);

    sendSuccess(res, {
      statusCode: status.CREATED,
      message: "Appointment created successfully with PayLater",
      data: result,
    });
  }
);
const handleAppointmentPayLater = asyncHandler(
  async (req: Request, res: Response) => {
    const {appointmentId} = req.body;
    const result = await appointmentServices.handlePayLater(appointmentId);

    sendSuccess(res, {
      statusCode: status.CREATED,
      message: "Appointment  paid successfully",
      data: result,
    });
  }
);


const cancelAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError("Appointment ID is required", status.BAD_REQUEST);
    }

    const result = await appointmentServices.cancelAppointment(id as string);

    sendSuccess(res, {
      statusCode: status.OK,
      message: "Appointment cancelled successfully",
      data: result,
    });
  }
);
const getPatientAppointments = asyncHandler(
  async (req: Request, res: Response) => {
   const userId = res.locals.auth.userId
    const result = await appointmentServices.getAllMyAppointments(userId as string,{
      
    });

    sendSuccess(res, {
      statusCode: status.OK,
      message: "Appointments fetch successfully",
      data: result.data,
      meta:result.meta
    });
  }
);

export const AppointmentController = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  cancelAppointment,
  createAppointmentWithPayLater,
  handleAppointmentPayLater,
  getPatientAppointments
};
