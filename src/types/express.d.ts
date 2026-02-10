
import { User, Session } from "better-auth";
import { UserRole } from "../generated/prisma/enums";

declare global {
  namespace Express {
    interface Locals {
      user: User;
      session: Session;
      // Your custom mapped data
      auth: {
        userId: string;
        role: UserRole
        doctorEmail:string | null
        patientEmail:string | null
      }
    }
  }
}