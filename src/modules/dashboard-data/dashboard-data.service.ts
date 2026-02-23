import status from "http-status";
import { UserRole } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { IRequestUser } from "../auth/auth.interface";

const getDashboardData = async (user: IRequestUser) => {
    let data;
    switch (user.role) {
        case UserRole.ADMIN:
            data = await getAdminDashboardData(user);
            break;
        case UserRole.PATIENT:
            data = await getPatientDashboardData(user);
            break;
        case UserRole.DOCTOR:
            data = await getDoctorDashboardData(user);
            break;
        default:
           throw new AppError("Invalid Role user",status.FORBIDDEN)
    }
    return data
}

const getAdminDashboardData = async (user: IRequestUser) => {
    

    // check admin exist 
    await prisma.user.findUniqueOrThrow({
        where:{
            email:user.email,
            role:UserRole.ADMIN
        }
    });

  const result = await prisma.$transaction(async (tx)=>{
        const patients = await tx.patient.count();
    const doctors = await tx.doctor.count();
    const appointments = await tx.appointment.groupBy({
        by:["status"],
        _count:{
            status:true
        }
    });
    const payments = await tx.payment.groupBy({
        by:["status"],
        _count:{
            status:true
        },
        _sum:{
            amount:true
        }
    })

    const reviews =await tx.review.groupBy({
        by:["rating"]
    })

    const formatedPayments = payments.map((payment) =>{
        return {
        status:payment.status,
        amount:payment._sum.amount,
        paymentCount:payment._count.status
        }
    })
    const formatedAppointments = appointments.map((appointment) =>{
        return {
        status:appointment.status,
        count:appointment._count.status
        }
    })



    return {
        patients,doctors,appointments:formatedAppointments,payments:formatedPayments,reviews
    }

  })
return result
}
const getDoctorDashboardData = async (user: IRequestUser) => {
    
    // check doctor exist 
    await prisma.user.findUniqueOrThrow({
        where:{
            email:user.email,
            role:UserRole.DOCTOR
        }
    });

  const result = await prisma.$transaction(async (tx)=>{
   
    const appointments = await tx.appointment.groupBy({
        by:["status"],
        _count:{
            status:true
        }
    });
    const latestAppointment = await tx.appointment.findMany({
      orderBy:{
        createdAt:"desc"
      }
    });

     const reviews =await tx.review.groupBy({
        by:["rating"]
    })
  
    

       const formatedAppointments = appointments.map((appointment) =>{
        return {
        status:appointment.status,
        count:appointment._count.status
        }
    })

    return {
        appointments:formatedAppointments,latestAppointment,reviews
    }

  })
return result
}
const getPatientDashboardData = async (user: IRequestUser) => {
    
    // check patient exist 
    await prisma.user.findUniqueOrThrow({
        where:{
            email:user.email,
            role:UserRole.PATIENT
        }
    });

  const result = await prisma.$transaction(async (tx)=>{
   
    const appointments = await tx.appointment.groupBy({
        by:["status"],
        _count:{
            status:true
        }
    
    });
    const payments = await tx.payment.groupBy({
        by:["status"],
        _count:{
            status:true
        },
        _sum:{
            amount:true
        }
    })

     const reviews =await tx.review.groupBy({
        by:["rating"]
    })
        const formatedPayments = payments.map((payment) =>{
        return {
        status:payment.status,
        amount:payment._sum.amount,
        paymentCount:payment._count.status
        }
    })

       const formatedAppointments = appointments.map((appointment) =>{
        return {
        status:appointment.status,
        count:appointment._count.status
        }
    })

    return {
        appointments:formatedAppointments,payments:formatedPayments,reviews
    }

  })
return result
}


export const dashboardDataServices = { getDashboardData }