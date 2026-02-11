import { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { adminServices } from "./admin.service";

// -------------------- GET ALL ADMIN  --------------------
const getAllAdminController = asyncHandler(async (req: Request, res: Response) => {

  const allAdmins = await adminServices.getAllAdminProfile()

  return sendSuccess(res, {
    statusCode:200,
    message: "All admin Profile Fetch Successfully",
    data:allAdmins
  })
});
// -------------------- GET ADMIN BY ID  --------------------
const getAdminByIdController = asyncHandler(async (req: Request, res: Response) => {

    const id = req.query.id

  const admin = await adminServices.getAdminById(id as string)

  return sendSuccess(res, {
    statusCode:200,
    message: "Admin Profile Fetch Successfully",
    data:admin
  })
});
// -------------------- DELETE ADMIN  --------------------
const deleteAdminController = asyncHandler(async (req: Request, res: Response) => {

    const id = req.query.id

  const admin = await adminServices.deleteAdminProfile(id as string,res.locals.auth)

  return sendSuccess(res, {
    statusCode:201,
    message: " Admin Profile Delete Successfully",
    data:admin
  })
});
// -------------------- UPDATE ADMIN  --------------------
const updateAdminController = asyncHandler(async (req: Request, res: Response) => {

    const id = req.query.id
    const data = req.body

  const updatedAdmin = await adminServices.updateAdminProfile({
    admidId:id as string,
    data
  })

  return sendSuccess(res, {
    statusCode:201,
    message: " Admin Profile Updated Successfully",
    data:updatedAdmin
  })
});

export const adminControllers = {
    getAllAdminController,
    getAdminByIdController,
    updateAdminController,
    deleteAdminController
}