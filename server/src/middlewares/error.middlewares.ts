import { config } from "../config/app.config.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { AppError } from "../lib/appError.js";
import { NextFunction, Request, Response } from "express";
import { prismaErrorHandler } from "../lib/errorHandler.js";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = err;

  const prismaError = prismaErrorHandler(error);
  
  if (prismaError) {
    error = prismaError;
  }

  if ((error instanceof AppError)) {
    let appError = error as AppError;

    const statusCode = appError.statusCode || HTTPSTATUS.INTERNAL_SERVER_ERROR;
    console.log(statusCode);
    console.log(appError)

    const message = appError.message || "Something went wrong";
    error = new AppError(message, statusCode, appError.errorCode);
  }

  const response = {
    ...error,
    success: error?.success || false,
    message: error?.message,
    ...(config.NODE_ENV === "development" ? { stack: error?.stack } : {}),
  };


  return res.status(error?.statusCode || HTTPSTATUS.INTERNAL_SERVER_ERROR).json(response);
};

export { errorHandler };
