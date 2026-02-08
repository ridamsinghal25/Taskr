import type { Request, Response } from "express";
import { UserService } from "../services/user.services.js";
import { BadRequestException } from "../lib/appError.js";
import { ApiResponse } from "../lib/ApiResponse.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { User } from "@prisma/client";

const userService = new UserService();

export class UserController {
  static async me(req: Request, res: Response): Promise<Response> {
    const user = await userService.getCurrentUser(req);

    if (!user) throw new BadRequestException("User not found");

    return res
    .status(HTTPSTATUS.OK)
    .json(
        new ApiResponse<User>(HTTPSTATUS.OK, user, "User fetched successfully")
    );
  }

}
