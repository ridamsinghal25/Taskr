import zod from "zod";

export const categorySchema = zod.object({
  name: zod
    .string()
    .trim()
    .regex(/^[a-zA-Z_-]+$/, "Category name must only contain letters, underscores and hyphens")
    .min(4, "Category name must be at least 4 characters long")
    .max(50, "Category name must be at most 50 characters long"),
});
