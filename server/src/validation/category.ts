import zod from "zod";

export const categorySchema = zod.object({
  name: zod
    .string()
    .trim()
    .regex(/^[a-zA-Z\s_-]+$/, "Name must contain only letters, spaces, underscores and hyphens")
    .min(4, "Name must be at least 4 characters long")
    .max(50, "Name must be at most 50 characters long"),
});
