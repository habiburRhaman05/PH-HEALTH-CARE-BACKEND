import { UserRole, UserStatus } from "../../generated/prisma/enums";

export interface DoctorQueryParams {
  page?: string;
  limit?: string;
  searchTerm?: string;
  specialty?: string;
  minFee?: string;
  maxFee?: string;
}



export interface IUpdateDoctorPayload {
  doctorId: string;
  data: Partial<{
    name: string;
    email: string;
    profilePhoto: string;
    address: string;
    registrationNumber: string;
    contactNumber: string;
    experience: number;
    averageRating: number;
    gender: "MALE" | "FEMALE";
    appointmentFee: number;
    qualification: string;
    currentWorkingPlace: string;
    designation: string;
    isDeleted: boolean;
    deletedAt: Date;
  }>;
  userData?: Partial<{
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    isDeleted: boolean;
    emailVerified: boolean;
  }>;
}