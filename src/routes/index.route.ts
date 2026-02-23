import { Router } from "express";
import authRouter from "../modules/auth/auth.route"
import specialityRouter from "../modules/specialty/specialty.route"
import doctorsRouter from "../modules/doctor/doctor.route"
import adminRouter from "../modules/admin/admin.route"
import superAdmin from "../modules/super-admin/super-admin.route"
import usersRouter from "../modules/users/user.route"
import reviewsRouter from "../modules/review/review.route"
import mediaRouter from "../modules/media/media.route"
import patientRouter from "../modules/patient/patient.route"
import appointmentRouter from "../modules/appointment/appoinment.route"
import scheduleRouter from "../modules/schedule/schedule.route"
import doctorScheduleRouter from "../modules/doctor-schedule/doctor-schedule.route"
import prescriptionRouter from "../modules/prescription/prescription.route";
import dashboardRouter from "../modules/dashboard-data/dashboard-data.route";

const indexRouter = Router();
indexRouter.use("/auth",authRouter)
indexRouter.use("/super-admins",superAdmin)
indexRouter.use("/admins",adminRouter)
indexRouter.use("/doctors",doctorsRouter)
indexRouter.use("/specialties",specialityRouter)
indexRouter.use("/schedules",scheduleRouter)
indexRouter.use("/doctor-schedules",doctorScheduleRouter)
indexRouter.use("/appointments",appointmentRouter)
indexRouter.use("/patients",patientRouter)
indexRouter.use("/media",mediaRouter)
indexRouter.use("/users",usersRouter)
indexRouter.use("/reviews",reviewsRouter)
indexRouter.use("/prescriptions",prescriptionRouter)
indexRouter.use("/dashboard-data",dashboardRouter)

export default indexRouter