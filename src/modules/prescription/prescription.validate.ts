import { z } from "zod";

const createPrescriptionSchema = z.object({
  body: z.object({
    appointmentId: z.string({ required_error: "Appointment ID is required" }),
    instructions: z.string({ required_error: "Instructions are required" }),
    followUpDate: z.string().optional(), // Expected as ISO String
  }),
});

const updatePrescriptionSchema = z.object({
  body: z.object({
    instructions: z.string().optional(),
    followUpDate: z.string().optional(),
  }),
});

export const PrescriptionValidation = {
  createPrescriptionSchema,
  updatePrescriptionSchema,
};