import zod from "zod";

export const categorySchema = zod.object({
  name: zod
    .string()
    .trim()
    .min(4, "Category name must be at least 4 characters long")
    .max(100, "Category name must be at most 100 characters long"),
});
