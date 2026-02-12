import { Request, Response, NextFunction } from "express";
import { superAdminServices } from "./super-admin.service";
import status from "http-status";
import { IUpdateAdmin } from "../admin/admin.interface";

 const getAllSuperAdminsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const superAdmins = await superAdminServices.getAllSuperAdmins();
    res.status(status.OK).json({ success: true, data: superAdmins });
  } catch (err) {
    next(err);
  }
};

 const getSuperAdminByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const superAdmin = await superAdminServices.getSuperAdminById(id as string);
    res.status(status.OK).json({ success: true, data: superAdmin });
  } catch (err) {
    next(err);
  }
};

 const updateSuperAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload: IUpdateAdmin = {
      admidId: req.params.id as string,
      admin: req.body.admin,
      user: req.body.user,
    };

    const updatedSuperAdmin =
      await superAdminServices.updateSuperAdminProfile(payload);

    res.status(status.OK).json({ success: true, data: updatedSuperAdmin });
  } catch (err) {
    next(err);
  }
};

export const superAdminControllers = {
    updateSuperAdminController,
    getAllSuperAdminsController,
    getSuperAdminByIdController
}