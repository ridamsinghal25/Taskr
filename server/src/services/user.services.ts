import prisma from "../db/db.js";
import { BadRequestException, NotFoundException } from "../lib/appError.js";
import type { Request } from "express";

export class UserService {
  async getCurrentUser(req: Request) {
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestException("User not found");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }
}
