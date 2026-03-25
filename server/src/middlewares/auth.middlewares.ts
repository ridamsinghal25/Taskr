import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { BadRequestException, UnauthorizedException } from "../lib/appError.js";
import prisma from "../db/db.js";
import { User } from "@prisma/client";

export const verifyToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const sessionToken = req.header("Authorization")?.replace("Bearer ", "");

  if (!sessionToken) {
    throw new UnauthorizedException("Unauthorized access");
  }

  const session = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
  });

  if (!session) {
    throw new UnauthorizedException("User is not authenticated");
  }

  if (session.expiresAt < new Date()) {
    throw new UnauthorizedException("Your session has expired. Please log in again.");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
  });

  if (!user) {
    throw new BadRequestException("User not found");
  }

  req.user = user as User;
  next();
});
