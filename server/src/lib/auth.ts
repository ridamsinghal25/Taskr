import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../db/db.js";
import { deviceAuthorization } from "better-auth/plugins";
import { config } from "../config/app.config.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: config.SERVER_URL,
  basePath: "/api/auth",
  trustedOrigins: [config.FRONTEND_ORIGIN],
  plugins: [
    deviceAuthorization({
      // Optional configuration
      expiresIn: "30m", // Device code expiration time
      interval: "5s", // Minimum polling interval
    }),
  ],
  socialProviders: {
    github: {
      clientId: config.GITHUB_CLIENT_ID,
      clientSecret: config.GITHUB_CLIENT_SECRET,
    },
  },

  logger: {
    level: "debug",
  },
});
