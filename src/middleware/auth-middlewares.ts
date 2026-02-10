import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { sendError } from "../utils/apiResponse";


export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // GETTING SESSION
    const session = await auth.api.getSession({
      headers: req.headers as any
    });

    // IF SESSION IS NOT FOUND
    if (!session) {
      return sendError(res, {
        message: "Unauthorized: Session expired or missing",
        statusCode: 401,
        errors: { message: "Unauthorized: Session expired or missing" }
      })
    }

    // SAVED USER INFO IN REQUEST
    res.locals.user = session.user;
    res.locals.session = session.session

    res.locals.auth = {
      userId: session.user.id,
      role: session.user.role as "DOCTOR" || "PATIENT" || "ADMIN",
      patientEmail:session.user.role === "PATIENT" ? session.user.email : null,
      doctorEmail:session.user.role === "DOCTOR" ? session.user.email : null
    };

    return next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during authentication"
    });
  }
}
export function roleMiddleware(allowedRoles: ("STUDENT" | "TUTOR" | "ADMIN")[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient role" });
    }
    next();
  };
}
