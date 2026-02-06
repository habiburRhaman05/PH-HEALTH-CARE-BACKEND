import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { envConfig } from "../config/env";

const JWT_SECRET = envConfig.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}


export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: "STUDENT" | "TUTOR" | "ADMIN";
  };
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const cookieToken = req.cookies?.token;

    const headerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

    const token = cookieToken || headerToken;

    if (!token) {
      return res.status(401).json({ error: "Authentication token missing" });
    }

    const payload =  jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!payload?.userId || !payload?.role) {
      return res.status(401).json({ error: "Invalid token payload" });
    }
 
    


    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch(error) {
    console.log("error",error);
    
    return res.status(401).json({ error: "Invalid or expired token" });
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
