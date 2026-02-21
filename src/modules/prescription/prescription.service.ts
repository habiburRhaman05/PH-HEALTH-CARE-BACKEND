import status from "http-status";
import { UserRole } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { IRequestUser } from "../auth/auth.interface";
import { generatePrescriptionBuffer, uploadPdfBufferToCloudinary } from "./prescription.utils";
import { emailQueue } from "../../queue/emailQueue";
import { ICreatePrescriptionPayload } from "./prescription.interface";

const doctorGivePrescription = async (user: IRequestUser, payload: ICreatePrescriptionPayload) => {
    // 1. Check if Doctor exists
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: { email: user.email },

    });

    // 2. Check if appointment exists and belongs to this doctor
    const appointment = await prisma.appointment.findUniqueOrThrow({
        where: { id: payload.appointmentId },
        include: { patient: true, doctor: true,  },

    });

    // check prescription already have on this appoinetment so we shoud update now

    const isPresciptionExist = await prisma.prescription.findUnique({
        where:{
            appointmentId:appointment.id
        }
    })

    if(isPresciptionExist){
        throw new AppError("prescription already have on this appoinetment so you should update now", status.BAD_REQUEST);

    }

    if (appointment.doctorId !== doctorData.id) {
        throw new AppError("This appointment does not belong to you", status.FORBIDDEN);
    }

    const samplePrescriptionData = {
    doctor: {
        name: appointment.doctor.name,
        specialization: doctorData.designation,
    },
    patient: {
        name: appointment.patient.name,
    },
    // Instructions সেকশনে ঔষধের নাম এবং নিয়মগুলো সুন্দর করে সাজিয়ে দেওয়া হয়েছে
    instructions: payload.instructions,
    
    followUpDate: payload.followUpDate // ISO Format অথবা Date Object
};

       const generatePdfBuffer = await generatePrescriptionBuffer(samplePrescriptionData);

    const { secure_url } = await uploadPdfBufferToCloudinary(generatePdfBuffer, appointment.id);
  if (!secure_url) {
        throw new AppError("failed to upload prescription pdf buffer in cloudinary", status.BAD_REQUEST)
    
    }

    // 3. Create prescription
    const result = await prisma.prescription.create({
        data: {
            appointmentId: payload.appointmentId,
            patientId: appointment.patientId,
            doctorId: doctorData.id,
            instructions: payload.instructions,
            followUpDate: payload.followUpDate || new Date(),
            prescriptionPdfUrl:secure_url

        },
        include: { patient: true, doctor: true, appointment: true },
    });


    const prescriptionData = {
    patientName: result.patient.name,                      // Full name of the patient
    patientEmail: result.patient.email,                      // Full name of the patient
    doctorName: result.doctor.name,                   // Name of the physician (without 'Dr.' prefix as the EJS adds it)
    date: new Date(result.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    }),                    // Format as a string (e.g., .toLocaleDateString())
    prescriptionDetails: result.instructions, // Short summary of medications/instructions
    pdfUrl: secure_url     // The 'secure_url' from your Cloudinary upload
};

    await emailQueue.add("prescription-email", prescriptionData)

    return result;
};

const getAllPrescription = async () => {
    return await prisma.prescription.findMany({
        include: {
            patient: { select: { name: true, email: true } },
            doctor: { select: { name: true, designation: true } },
            appointment: true,
        },
    });
};

const myPrescription = async (user: IRequestUser) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: { email: user.email },
    });

    if (userData.role === UserRole.DOCTOR) {
        const doctor = await prisma.doctor.findUniqueOrThrow({ where: { email: user.email } });
        return await prisma.prescription.findMany({
            where: { doctorId: doctor.id },
            include: { patient: true, appointment: true },
        });
    }

    if (userData.role === UserRole.PATIENT) {
        const patient = await prisma.patient.findUniqueOrThrow({ where: { email: user.email } });
        return await prisma.prescription.findMany({
            where: { patientId: patient.id },
            include: { doctor: true, appointment: true },
        });
    }
};

const updatePrescription = async (user: IRequestUser, id: string, payload: any) => {
    const doctor = await prisma.doctor.findUniqueOrThrow({ where: { email: user.email } });
    const prescription = await prisma.prescription.findUniqueOrThrow({ where: { id } });

    if (prescription.doctorId !== doctor.id) {
        throw new AppError("You can only update your own prescriptions", status.FORBIDDEN);
    }

    return await prisma.prescription.update({
        where: { id },
        data: payload,
    });
};

const deletePrescription = async (user: IRequestUser, id: string) => {
    const doctor = await prisma.doctor.findUniqueOrThrow({ where: { email: user.email } });
    const prescription = await prisma.prescription.findUniqueOrThrow({ where: { id } });

    if (prescription.doctorId !== doctor.id) {
        throw new AppError("You can only delete your own prescriptions", status.FORBIDDEN);
    }

    return await prisma.prescription.delete({ where: { id } });
};

export const prescriptionServices = {
    doctorGivePrescription,
    getAllPrescription,
    myPrescription,
    updatePrescription,
    deletePrescription,
};