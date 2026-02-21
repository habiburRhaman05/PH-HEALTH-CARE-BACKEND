import express from "express";
import { UserRole } from "../../generated/prisma/enums";
import { authMiddleware, roleMiddleware } from "../../middleware/auth-middlewares";
import { validateRequest } from "../../middleware/validateRequest";
import { PrescriptionValidation } from "./prescription.validate";
import { prescriptionControllers } from "./prescription.controller";


const prescriptionRouter = express.Router();

// Only Doctor can create
prescriptionRouter.post(
    "/",
    authMiddleware, roleMiddleware([UserRole.DOCTOR]),
    validateRequest(PrescriptionValidation.createPrescriptionSchema),
    prescriptionControllers.createPrescriptionController
);

// Admin might view all
prescriptionRouter.get("/",
    authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
    prescriptionControllers.getAllPrescriptionController);

// Patients and Doctors view their own
prescriptionRouter.get("/my-prescriptions",
    authMiddleware, roleMiddleware([UserRole.DOCTOR, UserRole.PATIENT]),
    prescriptionControllers.getMyPrescriptionController);

// Only Doctor can update/delete their own
prescriptionRouter.put(
    "/:id",
    authMiddleware, roleMiddleware([UserRole.DOCTOR]),
    validateRequest(PrescriptionValidation.updatePrescriptionSchema),
    prescriptionControllers.updatePrescriptionController
);

prescriptionRouter.delete("/:id",
    authMiddleware, roleMiddleware([UserRole.DOCTOR]),

    prescriptionControllers.deletePrescriptionController);

export default prescriptionRouter