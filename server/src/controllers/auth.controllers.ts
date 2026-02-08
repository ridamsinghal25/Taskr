import type { Request, Response } from "express";
import { BadRequestException } from "../lib/appError.js";
import { config } from "../config/app.config.js";

export class AuthController {
  static async deviceRedirect(req: Request, res: Response) {
    const { user_code } = req.query;

    if (!user_code || typeof user_code !== "string") {
      throw new BadRequestException("user_code is required");
    }

    const frontendUrl = config.FRONTEND_ORIGIN;

    if (!frontendUrl) {
      throw new BadRequestException("frontendUrl is not set");
    }

    return res.redirect(
      `${frontendUrl}/device?user_code=${encodeURIComponent(user_code)}`
    );
  }
}
