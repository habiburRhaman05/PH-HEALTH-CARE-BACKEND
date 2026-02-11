import { z } from "zod";

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


export const adminSchemas = {updateAdminZodSchema}