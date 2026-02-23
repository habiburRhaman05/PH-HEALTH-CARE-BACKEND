import status from "http-status";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { dashboardDataServices } from "./dashboard-data.service";

const getAdminDashboardData = asyncHandler(async(req,res)=>{
    const result = await dashboardDataServices.getDashboardData;
    sendSuccess(res,{
        statusCode:status.FOUND,
        message:"Fetch Dashboard Data Successfully",
        data:result
    })
})

export const dashboardControllers = {getAdminDashboardData}