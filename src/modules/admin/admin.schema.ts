import { z } from "zod";
import { UserStatus } from "../../generated/prisma/enums";

 const updateAdminZodSchema = z.object({
    body: z.object({
        admin: z.object({
            name: z.string({ invalid_type_error: "Name must be a string" }).optional(),
            profilePhoto: z.string().url("Profile photo must be a valid URL").optional(),
            contactNumber: z.string({ invalid_type_error: "Contact number must be a string" })
                .min(11, "Contact number must be at least 11 characters")
                .max(14, "Contact number must be at most 14 characters")
                .optional(),
        }).optional()
    })
});

const updateUserStatus = z.object({
    body:z.object({
        status:z.enum([UserStatus.ACTIVE,UserStatus.BANNED,UserStatus.DELETED],{
                required_error: "Status is required in the request body",
    invalid_type_error: "Status must be a specific string value"
        })
    })
})


export const adminSchemas = {updateAdminZodSchema,updateUserStatus}