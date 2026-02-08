import { Prisma } from "@prisma/client";
import { AppError } from "./appError.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { ErrorCodeEnum } from "../enums/errorCode.enum.js";

/**
 * Prisma error codes we explicitly care about
 */
export enum PrismaErrorCode {
  UNIQUE_CONSTRAINT = "P2002",
  RECORD_NOT_FOUND = "P2025",
  FOREIGN_KEY_CONSTRAINT = "P2003",
  DB_UNREACHABLE = "P1001",
  TLS_ERROR = "P1011",
}

/**
 * Handles Prisma errors and converts them to AppError instances
 * @param err - The error to handle
 * @returns AppError instance or null if error is not a Prisma error
 */
export function prismaErrorHandler(err: unknown): AppError | null {

  // 🔴 Database connection / startup errors
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return new AppError(
      "Database connection failed. Please check your DATABASE_URL or try again later.",
      HTTPSTATUS.SERVICE_UNAVAILABLE,
      ErrorCodeEnum.INTERNAL_SERVER_ERROR
    );
  }

  // 🟠 Known Prisma request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case PrismaErrorCode.UNIQUE_CONSTRAINT:
        return new AppError(
          "Duplicate record. This item already exists.",
          HTTPSTATUS.CONFLICT,
          ErrorCodeEnum.VALIDATION_ERROR
        );

      case PrismaErrorCode.RECORD_NOT_FOUND:
        return new AppError(
          "Record not found. The requested item does not exist.",
          HTTPSTATUS.NOT_FOUND,
          ErrorCodeEnum.RESOURCE_NOT_FOUND
        );

      case PrismaErrorCode.FOREIGN_KEY_CONSTRAINT:
        return new AppError(
          "Invalid reference. Related record does not exist.",
          HTTPSTATUS.BAD_REQUEST,
          ErrorCodeEnum.VALIDATION_ERROR
        );

      case PrismaErrorCode.DB_UNREACHABLE:
        return new AppError(
          "Database unreachable. Please check your database connection and try again.",
          HTTPSTATUS.SERVICE_UNAVAILABLE,
          ErrorCodeEnum.INTERNAL_SERVER_ERROR
        );

      case PrismaErrorCode.TLS_ERROR:
        return new AppError(
          "Secure connection failed. TLS/SSL configuration error. Please try again later.",
          HTTPSTATUS.SERVICE_UNAVAILABLE,
          ErrorCodeEnum.INTERNAL_SERVER_ERROR
        );

      default:
        return new AppError(
          "Database error. ${err.message}",
          HTTPSTATUS.INTERNAL_SERVER_ERROR,
          ErrorCodeEnum.INTERNAL_SERVER_ERROR
        );
    }
  }

  // 🟡 Validation / malformed query errors
  if (
    err instanceof Prisma.PrismaClientValidationError ||
    err instanceof Prisma.PrismaClientUnknownRequestError
  ) {
    return new AppError(
      "Invalid database operation. Please check your input and try again.",
      HTTPSTATUS.BAD_REQUEST,
      ErrorCodeEnum.VALIDATION_ERROR
    );
  }

  return null;
}
