import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../db/db.js";
import { deviceAuthorization } from "better-auth/plugins";
import { config } from "../config/app.config.js";
import { emailOTP } from "better-auth/plugins";
import { sendEmail } from "./email.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: config.SERVER_URL,
  basePath: "/api/auth",
  trustedOrigins: [config.FRONTEND_ORIGIN, config.CHROME_ORIGIN],
  plugins: [
    deviceAuthorization({
      // Optional configuration
      expiresIn: "30m", // Device code expiration time
      interval: "5s", // Minimum polling interval
      schema: {}
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          console.log("Sending verification OTP to email: ", email);
          console.log("OTP: ", otp);
          console.log("Type: ", type);

          const htmlContent = `
            <div>
              <h1>Verification OTP</h1>
              <p>Your verification OTP is ${otp}</p>
            </div>
          `;

          const textContent = `Your verification OTP is ${otp}`;

          const response = await sendEmail({
            email: email,
            subject: "Verification OTP",
            htmlContent: htmlContent,
            textContent: textContent,
          });

          console.log("Response: ", response);
        }
      },
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
