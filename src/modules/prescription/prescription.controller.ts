import { Request, Response } from "express";
import status from "http-status";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { prescriptionServices } from "./prescription.service";

const createPrescriptionController = asyncHandler(async (req: Request, res: Response) => {
  const user = res.locals.auth;
  const result = await prescriptionServices.doctorGivePrescription(user, req.body);
  sendSuccess(res, {
    statusCode: status.CREATED,
    message: "Prescription created successfully",
    data: result,
  });
});

const getAllPrescriptionController = asyncHandler(async (req: Request, res: Response) => {
  const result = await prescriptionServices.getAllPrescription();
  sendSuccess(res, {
    statusCode: status.OK,
    message: "Prescriptions fetched successfully",
    data: result,
  });
});

const getMyPrescriptionController = asyncHandler(async (req: Request, res: Response) => {
  const user = res.locals.auth;
  const result = await prescriptionServices.myPrescription(user);
  sendSuccess(res, {
    statusCode: status.OK,
    message: "My prescriptions fetched successfully",
    data: result,
  });
});

const updatePrescriptionController = asyncHandler(async (req: Request, res: Response) => {
  const user = res.locals.auth;
  const { id } = req.params;
  const result = await prescriptionServices.updatePrescription(user, id as string, req.body);
  sendSuccess(res, {
    statusCode: status.OK,
    message: "Prescription updated successfully",
    data: result,
  });
});

const deletePrescriptionController = asyncHandler(async (req: Request, res: Response) => {
  const user = res.locals.auth;
  const { id } = req.params;
  const result = await prescriptionServices.deletePrescription(user, id as string);
  sendSuccess(res, {
    statusCode: status.OK,
    message: "Prescription deleted successfully",
    data: result,
  });
});

export const prescriptionControllers = {
  createPrescriptionController,
  getAllPrescriptionController,
  getMyPrescriptionController,
  updatePrescriptionController,
  deletePrescriptionController,
};