import { Request, Response } from "express";
import { auth } from "../../lib/auth";
import { AppError } from "../../utils/AppError";
import type { IChangePassword, ILoginUserPayload, IRegisterPayload, IRequestUser, } from "./auth.interface";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { UserStatus } from "../../generated/prisma/enums";
import status from "http-status"
import { CookieUtils } from "../../utils/cookie";
import { envConfig } from "../../config/env";
import { jwtUtils } from "../../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
const isProduction = envConfig.NODE_ENV === "production";

// -------------------- REGISTER --------------------
const registerPatient = async (payload: IRegisterPayload): Promise<any> => {

    const { user } = await auth.api.signUpEmail({
        body: payload
    });
    try {

        const patient = await prisma.$transaction(async (tx) => {
            const patientTx = await tx.patient.create({
                data: {
                    name: user.name,
                    email: user.email,
                    userId: user.id
                }
            });
            return patientTx
        })

        const accessToken = tokenUtils.getAccessToken({
            userId: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            status: user.status,
            isDeleted: user.isDeleted,
            emailVerified: user.emailVerified,
        });

        const refreshToken = tokenUtils.getRefreshToken({
            userId: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            status: user.status,
            isDeleted: user.isDeleted,
            emailVerified: user.emailVerified,
        });

        return {
            user,
            patient,
            accessToken,
            refreshToken
        };
    } catch (error) {
        console.log("failed to register patient");

        await prisma.user.delete({
            where: {
                id: user.id
            }
        })
        throw error;
    }
};

// -------------------- LOGIN --------------------
// send cookie with better auth
// const loginUser = async (payload: LoginPayload):Promise<any> => {
//   const response = await auth.api.signInEmail({
//     body: payload,
//     asResponse: true,
//   });

// };

const loginUser = async (payload: ILoginUserPayload) => {
    const { email, password } = payload;

    const data = await auth.api.signInEmail({
        body: {
            email,
            password,
        }
    })

    if (data.user.status === UserStatus.BANNED) {
        throw new AppError("User is blocked", status.FORBIDDEN);
    }

    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
        throw new AppError("User is deleted", status.NOT_FOUND);
    }



    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    });

    return {
        ...data,
        accessToken,
        refreshToken,
    };

}

// -------------------- USER PROFILE --------------------



const getUserProfile = async (user: IRequestUser) => {
  // ===============================
  // 1️⃣ Get Base User
  // ===============================
  const baseUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  if (!baseUser) {
    throw new AppError("User not found", status.NOT_FOUND);
  }

  let profile: any = null;

  // ===============================
  // 2️⃣ PATIENT
  // ===============================
  if (baseUser.role === "PATIENT") {
    const patient = await prisma.patient.findUnique({
      where: { userId: baseUser.id },
      include: {
        patientHealthData: true,
        medicalReports: true,
        appointment: {
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                designation: true,
              },
            },
            schedule: true,
          },
        },
        reviews: true,
        prescription: true,
      },
    });

    if (!patient) {
      throw new AppError("Patient profile not found", status.NOT_FOUND);
    }

    profile = patient;
  }

  // ===============================
  // 3️⃣ DOCTOR
  // ===============================
  if (baseUser.role === "DOCTOR") {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: baseUser.id },
      include: {
        specialty: {
          include: {
            specialty: {
              select: {
                id: true,
                title: true,
                icon: true,
              },
            },
          },
        },
        schedule: true,
        reviews: true,
        appoinments: true,
        prescriptions: true,
      },
    });

    if (!doctor) {
      throw new AppError("Doctor profile not found", status.NOT_FOUND);
    }

    // 🔥 Flatten specialty structure
    const formattedSpecialties = doctor.specialty.map((item) => ({
      id: item.specialty.id,
      title: item.specialty.title,
      icon: item.specialty.icon,
    }));

    // Remove raw relation array and replace with clean structure
    const { specialty, ...doctorRest } = doctor;

    profile = {
      ...doctorRest,
      specialty: formattedSpecialties,
    };
  }

  // ===============================
  // 4️⃣ ADMIN / SUPER_ADMIN
  // ===============================
  if (
    baseUser.role === "ADMIN" ||
    baseUser.role === "SUPER_ADMIN"
  ) {
    const admin = await prisma.admin.findUnique({
      where: { userId: baseUser.id },
    });

    if (!admin) {
      throw new AppError("Admin profile not found", status.NOT_FOUND);
    }

    profile = admin;
  }

  // ===============================
  // 5️⃣ Final Response
  // ===============================
  return {
    user: baseUser,
    profile,
  };
};



// -------------------- LOGOUT USER --------------------

const logoutUser = async (sessionToken: string) => {
    const result = await auth.api.signOut({
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`
        })
    })
    return result;
}


// -------------------- CHANGE PASSWORD --------------------

const changePassword = async (payload: IChangePassword) => {
    try {

        const isSessionExist = await prisma.session.findUnique({
            where:{
                token:payload.sessionToken
            }
        });


        if(!isSessionExist){
            throw new AppError("Session not fould",status.NOT_FOUND)
        }

        

        const updatedUser = await auth.api.changePassword({
            headers: new Headers({
                Authorization: `Bearer ${payload.sessionToken}`
            }),
            body: {
                currentPassword: payload.currentPassword,
                newPassword: payload.newPassword
            }
        });

        return updatedUser;
    } catch (error: any) {
       console.log(error);
       
        const message = error?.response?.data?.message || "Failed to update password. Please try again.";
        throw new AppError(message,400);
    }
}

const getAllNewTokens = async (refreshToken: string, sessionToken: string) => {
    // 1. Verify Session if exist or not
    const session = await prisma.session.findUnique({
        where: { token: sessionToken },
    });

    if (!session) {
        throw new AppError("Invalid session token", status.UNAUTHORIZED);
    }

    // 2. Verify Refresh Token
    const verified = jwtUtils.verifyToken(refreshToken, envConfig.REFRESH_TOKEN_SECRET);

    if (!verified.success || !verified.data) {
        throw new AppError("Invalid refresh token", status.UNAUTHORIZED);
    }

    const payload = verified.data as JwtPayload;

    // 3. Generate new tokens (Cleaned up by passing the payload directly)
    const tokenPayload = {
        userId: payload.userId,
        role: payload.role,
        name: payload.name,
        email: payload.email,
        status: payload.status,
        isDeleted: payload.isDeleted,
        emailVerified: payload.emailVerified,
    };
// creating a new tokens
    const accessToken = tokenUtils.getAccessToken(tokenPayload);
    const newRefreshToken = tokenUtils.getRefreshToken(tokenPayload);

    // 4. Update session expiry
    const updatedSession = await prisma.session.update({
        where: { token: sessionToken },
        data: {
            expiresAt: new Date(Date.now() + 60 * 60 * 24 * 1000), // Fixed: 24 hours
            updatedAt: new Date(),
        }
    });

    return {
        accessToken,
        refreshToken: newRefreshToken,
        sessionToken: updatedSession.token,
    };
};

const requestResetPassword = async (email:string)=>{
    const response = await auth.api.requestPasswordReset({
    body:{
        email
    }

});

 if(response.status === true){
    return true
 }
 return false

}
const resetPassword = async (newPassword:string,token:string)=>{
    const response = await auth.api.resetPassword({
    body:{

        token,
        newPassword
    }

});

 if(response.status === true){
    return true
 }
 return false

}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const googleLoginSuccess = async (session : Record<string, any>) =>{
    const isPatientExists = await prisma.patient.findUnique({
        where : {
            userId : session.user.id,
        }
    })

    if(!isPatientExists){
        await prisma.patient.create({
            data : {
                userId : session.user.id,
                name : session.user.name,
                email : session.user.email,
            }
        
        })
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
    });

    return {
        accessToken,
        refreshToken,
    }
}

export const authServices = { registerPatient, loginUser, getUserProfile, logoutUser,changePassword,getAllNewTokens,requestResetPassword,resetPassword,googleLoginSuccess };
