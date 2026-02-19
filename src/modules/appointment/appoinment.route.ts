import express from "express";
import { AppointmentController } from "./appoinment.controller";
import { authMiddleware, roleMiddleware } from "../../middleware/auth-middlewares";
import { validateRequest } from "../../middleware/validateRequest";
import { appointmentSchemas } from "./appointment.schema";

const router = express.Router();

router.get("/",
    authMiddleware,
    roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
    AppointmentController.getAllAppointments);
router.get("/:id",
    authMiddleware,
    roleMiddleware(["ADMIN", "DOCTOR", "SUPER_ADMIN", "PATIENT"]),
    AppointmentController.getAppointmentById);
    // create 
router.post("/",
    authMiddleware,
    roleMiddleware(["PATIENT"]),
    validateRequest(appointmentSchemas.createAppointmentZodSchema),
    AppointmentController.createAppointment);
    //create
router.post("/book-with-pay-later",
    authMiddleware,
    roleMiddleware(["PATIENT"]),
    validateRequest(appointmentSchemas.createAppointmentZodSchema),
    AppointmentController.createAppointmentWithPayLater);
router.post("/pay-later/:appointmentId",
    authMiddleware,
    roleMiddleware(["PATIENT"]),
    // add a schema
    AppointmentController.handleAppointmentPayLater);
router.get("/:patientId",
    authMiddleware,
    roleMiddleware(["PATIENT"]),
    // AppointmentController.getAppointmentPatientId
);
router.patch("/:id/cancel",
    authMiddleware,
    roleMiddleware(["ADMIN", "PATIENT", "SUPER_ADMIN"]),
    AppointmentController.cancelAppointment);

export default router;
