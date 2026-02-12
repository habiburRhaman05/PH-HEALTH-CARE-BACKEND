
import express from "express";
import { doctorController } from "./doctor.controller";
import { authMiddleware, roleMiddleware } from "../../middleware/auth-middlewares";
import { validateRequest } from "../../middleware/validateRequest";
import { updateDoctorSchema } from "./doctor.schema";

const router = express.Router();

router.get("/", doctorController.getAllDoctors);
router.get("/:id", doctorController.getDoctorById);
router.put("/:id", authMiddleware, roleMiddleware(["ADMIN", "DOCTOR"]), validateRequest(updateDoctorSchema), doctorController.updateDoctor);
router.delete("/:id", authMiddleware, roleMiddleware(["ADMIN"]), doctorController.deleteDoctor);

export default router;

