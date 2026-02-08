import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { BadRequestException, UnauthorizedException } from "../lib/appError.js";
import prisma from "../db/db.js";

export const verifyToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionToken = req.header("Authorization")?.replace("Bearer ", "");

    if (!sessionToken) {
      throw new UnauthorizedException("Unauthorized");
    }

    const session = await prisma.session.findUnique({
      where: {
        token: sessionToken,
      },
    });

    if (!session) {
      throw new UnauthorizedException("User is not authenticated");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    req.user = user;
    next();
    } catch (error) {
        if (error instanceof Error) {
          throw new BadRequestException(error.message);
        }
        throw new BadRequestException("Invalid token");
    }
  }
);
