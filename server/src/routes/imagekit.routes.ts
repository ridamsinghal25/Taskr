import { Router } from "express";
import { ImageKitController } from "../controllers/imagekit.controllers.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const imageKitRouter = Router();

imageKitRouter.get("/auth", asyncHandler(ImageKitController.getAuthParameters));

imageKitRouter.post("/bulk-delete", asyncHandler(ImageKitController.bulkDeleteFiles));

export default imageKitRouter;
