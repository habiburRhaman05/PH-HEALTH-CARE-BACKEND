import { Router } from "express";
import authRouter from "../modules/auth/auth.route"
import specialityRouter from "../modules/specialty/specialty.route"
import doctorsRouter from "../modules/doctor/doctor.route"
import adminRouter from "../modules/admin/admin.route"
import usersRouter from "../modules/users/user.route"
const indexRouter = Router();
indexRouter.use("/auth",authRouter)
indexRouter.use("/admin",adminRouter)
indexRouter.use("/doctor",doctorsRouter)
indexRouter.use("/speciality",specialityRouter)
indexRouter.use("/user",usersRouter)

export default indexRouter