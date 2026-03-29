import type { Request, Response } from "express";
import { config } from "../config/app.config.js";
import { imageKitClient } from "../lib/imagekit.js";
import { ApiResponse } from "../lib/ApiResponse.js";
import { BadRequestException, InternalServerException } from "../lib/appError.js";

export class ImageKitController {
  static async getAuthParameters(_req: Request, res: Response) {
    if (!config.IMAGEKIT_PRIVATE_KEY || !config.IMAGEKIT_PUBLIC_KEY) {
      throw new InternalServerException("ImageKit is not configured");
    }

    const { token, expire, signature } =
      imageKitClient.helper.getAuthenticationParameters();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          token,
          expire,
          signature,
          publicKey: config.IMAGEKIT_PUBLIC_KEY,
        },
        "ImageKit authentication parameters",
      ),
    );
  }

  static async bulkDeleteFiles(req: Request, res: Response) {
    const { fileIds } = req.body;

    if (!fileIds) {
      throw new BadRequestException("Files are required");
    }

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      throw new BadRequestException("Files must be a non-empty array");
    }

    const result = await imageKitClient.files.bulk.delete({
      fileIds: fileIds,
    });

    if (result.successfullyDeletedFileIds && result.successfullyDeletedFileIds.length > 0) {
      return res.status(200).json(new ApiResponse(200, result, "Files deleted successfully"));
    } else {
      throw new InternalServerException("Failed to delete files");
    }
  }
}
