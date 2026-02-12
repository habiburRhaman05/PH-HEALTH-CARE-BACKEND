import { Router } from "express";
import authRouter from "../modules/auth/auth.route"
import specialityRouter from "../modules/specialty/specialty.route"
import doctorsRouter from "../modules/doctor/doctor.route"
import adminRouter from "../modules/admin/admin.route"
import superAdmin from "../modules/super-admin/super-admin.route"
import usersRouter from "../modules/users/user.route"
import appointmentRouter from "../modules/appointment/appoinment.route"
const indexRouter = Router();
indexRouter.use("/auth",authRouter)
indexRouter.use("/super-admins",superAdmin)
indexRouter.use("/admins",adminRouter)
indexRouter.use("/doctors",doctorsRouter)
indexRouter.use("/specialties",specialityRouter)
indexRouter.use("/appointments",appointmentRouter)
indexRouter.use("/users",usersRouter)

export default indexRouter