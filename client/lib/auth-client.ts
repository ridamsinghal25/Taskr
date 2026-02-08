import { deviceAuthorizationClient } from "better-auth/plugins";
import { createAuthClient } from "better-auth/react";
import { createAuthClient as createAuthClientNode } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3005",
  plugins: [deviceAuthorizationClient()],
});

export const authClientNode = createAuthClientNode({
  baseURL: "http://localhost:3005",
  plugins: [deviceAuthorizationClient()],
});
