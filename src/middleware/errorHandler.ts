import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';




export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  console.error("❌ Error:", err.stack || err);

  const statusCode = err instanceof AppError ? err.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    error: {message:err.message || "Internal Server Error"},
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
