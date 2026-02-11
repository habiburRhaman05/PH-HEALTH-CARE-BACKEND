import { z } from "zod";
import { Gender } from "../../generated/prisma/enums";

 const createDoctorZodSchema = z.object({
  body:z.object({
        password: z.string({ required_error: "Password is required" })
        .min(6, "Password must be at least 6 characters")
        .max(20, "Password must be at most 20 characters"),
    doctor: z.object({
        name: z.string({ required_error: "Name is required" })
            .min(5, "Name must be at least 5 characters")
            .max(30, "Name must be at most 30 characters"),

        email: z.string({ required_error: "Email is required" })
            .email("Invalid email address"),

        contactNumber: z.string({ required_error: "Contact number is required" })
            .min(11, "Contact number must be at least 11 characters")
            .max(14, "Contact number must be at most 14 characters"),

        address: z.string()
            .min(10, "Address must be at least 10 characters")
            .max(100, "Address must be at most 100 characters")
            .optional(),

        registrationNumber: z.string({ required_error: "Registration number is required" }),

        experience: z.number().int("Experience must be an integer").nonnegative().optional(),

        // Using Object.values ensures compatibility with Prisma Enums
        gender: z.enum(Object.values(Gender) as [string, ...string[]], {
            errorMap: () => ({ message: "Gender must be either MALE or FEMALE" })
        }),

        appointmentFee: z.number({ required_error: "Fee is required" }).nonnegative(),

        qualification: z.string().min(2).max(50),

        currentWorkingPlace: z.string().min(2).max(50),

        designation: z.string().min(2).max(50),
    }),
    // specialties should be an array of strings that follow UUID format
    specialties: z.array(z.string().uuid("Invalid Specialty ID"))
        .min(1, "At least one specialty is required")
  })
});

 const createAdminZodSchema = z.object({
  body:z.object({
      password: z.string().min(6).max(20),
    admin: z.object({
        name: z.string().min(5).max(30),
        email: z.string().email("Invalid email address"),
        contactNumber: z.string().min(11).max(14).optional(),
        profilePhoto: z.string().url("Profile photo must be a valid URL").optional(),
    }),
    role: z.enum(["ADMIN", "SUPER_ADMIN"], {
        errorMap: () => ({ message: "Role must be either ADMIN or SUPER_ADMIN" })
    })
  })
});

export const userZodSchemas = {createAdminZodSchema,createDoctorZodSchema} 