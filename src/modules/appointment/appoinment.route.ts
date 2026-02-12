import express from "express";
import { AppointmentController } from "./appoinment.controller";
import { authMiddleware, roleMiddleware } from "../../middleware/auth-middlewares";

const router = express.Router();

router.get("/",
    authMiddleware,
    roleMiddleware(["ADMIN", "DOCTOR", "SUPER_ADMIN"]),
    AppointmentController.getAllAppointments);
router.get("/:id",
    authMiddleware,
    roleMiddleware(["ADMIN", "DOCTOR", "SUPER_ADMIN", "PATIENT"]),
    AppointmentController.getAppointmentById);
router.post("/",
    authMiddleware,
    roleMiddleware(["PATIENT"]),
    AppointmentController.createAppointment);
router.patch("/:id/cancel",
    authMiddleware,
    roleMiddleware(["ADMIN", "PATIENT", "SUPER_ADMIN"]),
    AppointmentController.cancelAppointment);

export default router;
