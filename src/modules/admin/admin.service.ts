import { UserStatus } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma"
import { AppError } from "../../utils/AppError";
import { IRequestUser } from "../auth/auth.interface";
import { IUpdateAdmin } from "./admin.interface";
import status from "http-status"
const getAllAdminProfile = async ()=>{
    const allAdmin = await prisma.admin.findMany({
        include:{
            user:true
        }
    });

  return allAdmin

}
const updateAdminProfile = async (payload:IUpdateAdmin)=>{
    const {admidId:id,data} = payload
       const isAdminExist = await prisma.admin.findUnique({
        where: {
            id,
        }
    })

    if (!isAdminExist) {
        throw new AppError("Admin Or Super Admin not found",status.NOT_FOUND);
    }

   

    const updatedAdmin = await prisma.admin.update({
        where: {
            id,
        },
        data: {
            ...data,
        }
    })

    return updatedAdmin;

}
const deleteAdminProfile = async (id:string,user:{userId:string})=>{
      

    const isAdminExist = await prisma.admin.findUnique({
        where: {
            id,
        }
    })

    if (!isAdminExist) {
        throw new AppError("Admin Or Super Admin not found",status.NOT_FOUND);
    }

    if(isAdminExist.id === user.userId){
        throw new AppError( "You cannot delete yourself",status.BAD_REQUEST);
    }

    const result = await prisma.$transaction(async (tx) => {
        await tx.admin.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        })

        await tx.user.update({
            where: { id: isAdminExist.userId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                status: UserStatus.DELETED // Optional: you may also want to block the user
            },
        })

        await tx.session.deleteMany({
            where: { userId: isAdminExist.userId }
        })

        await tx.account.deleteMany({
            where: { userId: isAdminExist.userId }
        })

        const admin = await getAdminById(id);

        return admin;
    }
    )

    return result;
}
const getAdminById = async (id:string)=>{
         const isAdminExist = await prisma.admin.findUnique({
        where: {
            id,
        },
        include:{user:true}
    })

    if (!isAdminExist) {
        throw new AppError("Admin Or Super Admin not found",status.NOT_FOUND);
    }
    
    return isAdminExist
}



export const adminServices = {
    getAdminById,
    getAllAdminProfile,
    updateAdminProfile,
    deleteAdminProfile
}