import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { UserController } from "../controllers/user.controllers.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const userRouter = Router();

userRouter.use(verifyToken);

userRouter.get("/me", asyncHandler(UserController.me));

export default userRouter;
