import { Response } from "express";

type SuccessOptions = {
  statusCode?: number;
  message?: string;
  data?: any;
};

type ErrorOptions = {
  statusCode?: number;
  message: string;
  errors?: any;
};

export const sendSuccess = (
  res: Response,
  { statusCode = 200, message = "Success", data }: SuccessOptions
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};

export const sendError = (
  res: Response,
  {
    statusCode = 500,
    message = "Something went wrong",
    errors,

  }: ErrorOptions
) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,

    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};
