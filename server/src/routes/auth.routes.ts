import { Router } from "express";
import { AuthController } from "../controllers/auth.controllers.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const authRouter = Router();

/**
 * CLI Device Login Redirect
 * GET /auth/device?user_code=XXXX
 */
authRouter.get("/device", asyncHandler(AuthController.deviceRedirect));

export default authRouter;
