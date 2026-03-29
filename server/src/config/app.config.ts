import { getEnv } from "../lib/getEnv.js";

const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("PORT", "5000"),
  SERVER_URL: getEnv("SERVER_URL", "http://localhost:3005"),
  DATABASE_URL: getEnv("DATABASE_URL", ""),

  GITHUB_CLIENT_ID: getEnv("GITHUB_CLIENT_ID", ""),
  GITHUB_CLIENT_SECRET: getEnv("GITHUB_CLIENT_SECRET", ""),

  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "localhost"),
  CHROME_ORIGIN: getEnv("CHROME_ORIGIN"),

  IMAGEKIT_PRIVATE_KEY: getEnv("IMAGEKIT_PRIVATE_KEY", ""),
  IMAGEKIT_PUBLIC_KEY: getEnv("IMAGEKIT_PUBLIC_KEY", ""),
});

export const config = appConfig();
