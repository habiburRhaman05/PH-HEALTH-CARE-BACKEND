
import { z } from "zod";

export const updateDoctorSchema = z.object({
    body:z.object({
        
  name: z.string().min(2).max(100).optional(),

  email: z
    .string()
    .email("Invalid email format")
    .optional(),

  profilePhoto: z
    .string()
    .url("Profile photo must be a valid URL")
    .optional(),

  address: z.string().max(255).optional(),

  registrationNumber: z
    .string()
    .min(3)
    .max(50)
    .optional(),

  contactNumber: z
    .string()
    .min(6)
    .max(20)
    .optional(),

  experience: z
    .number()
    .int()
    .min(0)
    .max(60)
    .optional(),

  averageRating: z
    .number()
    .min(0)
    .max(5)
    .optional(),

  gender: z
    .enum(["MALE", "FEMALE"])
    .optional(),

  appointmentFee: z
    .number()
    .min(0)
    .optional(),

  qualification: z
    .string()
    .min(2)
    .max(200)
    .optional(),

  currentWorkingPlace: z
    .string()
    .min(2)
    .max(200)
    .optional(),

  designation: z
    .string()
    .min(2)
    .max(100)
    .optional(),

  isDeleted: z.boolean().optional(), // usually restrict this via role

    })
});
