import { UserRole } from "../../generated/prisma/enums";
import { IRequestUser } from "../auth/auth.interface";
import { getAdminDashboardData } from "./dashboard-data.utils";

const getDashboardData = async (user:IRequestUser)=>{
    let data;
    switch (user.role) {
        case UserRole.ADMIN:
            data = await getAdminDashboardData();
            break;
    
        default:
            break;
    }
}

export const dashboardDataServices = {getDashboardData}