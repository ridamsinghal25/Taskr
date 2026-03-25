import zod from "zod";

export const categorySchema = zod.object({
  name: zod
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9\s_\-()\[\]{}&.,'":!?/@#%$§]+$/, "Category name contains invalid characters")
    .min(4, "Category name must be at least 4 characters long")
    .max(50, "Category name must be at most 50 characters long"),
});
