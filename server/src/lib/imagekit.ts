import ImageKit from "@imagekit/nodejs";
import { config } from "../config/app.config.js";

export const imageKitClient = new ImageKit({
  privateKey: config.IMAGEKIT_PRIVATE_KEY || undefined,
});
